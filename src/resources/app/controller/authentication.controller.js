const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../model/user.model');

const {
    ACCESS_TOKEN_SECRET = 'default_access_token_secret',
    REFRESH_TOKEN_SECRET = 'default_refresh_token_secret',
    ACCESS_TOKEN_EXPIRES_IN = '15m',
    REFRESH_TOKEN_EXPIRES_IN = '7d',
    REFRESH_TOKEN_COOKIE_MAX_AGE_DAYS = '7',
    NODE_ENV,
} = process.env;

const REFRESH_COOKIE_NAME = 'refreshToken';
const REFRESH_COOKIE_MAX_AGE = (() => {
    const days = parseInt(REFRESH_TOKEN_COOKIE_MAX_AGE_DAYS, 10);
    const safeDays = Number.isNaN(days) ? 7 : days;
    return safeDays * 24 * 60 * 60 * 1000;
})();

const baseCookieOptions = {
    httpOnly: true,
    secure: NODE_ENV === 'production',
    sameSite: NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
    maxAge: REFRESH_COOKIE_MAX_AGE,
};

const buildUserPayload = (user) => ({
    id: user._id,
    hovaten: user.hovaten,
    tendangnhap: user.tendangnhap,
    email: user.email,
    sodienthoai: user.sodienthoai,
});

class AuthenticationController {
    generateAccessToken(user) {
        return jwt.sign(
            {
                id: user._id,
                tendangnhap: user.tendangnhap,
                email: user.email,
            },
            ACCESS_TOKEN_SECRET,
            { expiresIn: ACCESS_TOKEN_EXPIRES_IN },
        );
    }

    generateRefreshToken(user) {
        return jwt.sign(
            {
                id: user._id,
            },
            REFRESH_TOKEN_SECRET,
            { expiresIn: REFRESH_TOKEN_EXPIRES_IN },
        );
    }

    setRefreshTokenCookie(res, token) {
        res.cookie(REFRESH_COOKIE_NAME, token, baseCookieOptions);
    }

    clearRefreshTokenCookie(res) {
        res.clearCookie(REFRESH_COOKIE_NAME, {
            ...baseCookieOptions,
            maxAge: 0,
        });
    }

    extractAccessToken(req) {
        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            return authHeader.substring(7);
        }
        if (req.headers['x-access-token']) {
            return req.headers['x-access-token'];
        }
        return req.body?.token || req.query?.token || null;
    }

    async login(req, res) {
        try {
            const { tendangnhap, matkhau } = req.body;
            console.log(tendangnhap, matkhau);
            if (!tendangnhap || !matkhau) {
                return res.status(400).json({
                    message: 'Vui lòng nhập đầy đủ tài khoản và mật khẩu',
                });
            }

            const user = await User.findOne({
                $or: [{ tendangnhap }, { email: tendangnhap }],
            });

            if (!user) {
                return res.status(401).json({
                    message: 'Tài khoản hoặc mật khẩu không chính xác',
                });
            }

            const isPasswordValid = await bcrypt.compare(matkhau, user.matkhau);

            if (!isPasswordValid) {
                return res.status(401).json({
                    message: 'Tài khoản hoặc mật khẩu không chính xác',
                });
            }

            const accessToken = this.generateAccessToken(user);
            const refreshToken = this.generateRefreshToken(user);

            user.refreshToken = refreshToken;
            await user.save();

            this.setRefreshTokenCookie(res, refreshToken);

            return res.status(200).json({
                message: 'Đăng nhập thành công',
                accessToken,
                user: buildUserPayload(user),
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                message: 'Lỗi server vui lòng thử lại sau :((',
            });
        }
    }

    async logout(req, res) {
        try {
            const refreshToken =
                req.cookies?.[REFRESH_COOKIE_NAME] || req.body?.refreshToken;

            if (refreshToken) {
                const user = await User.findOne({ refreshToken });
                if (user) {
                    user.refreshToken = null;
                    await user.save();
                }
            }

            this.clearRefreshTokenCookie(res);

            return res.status(200).json({
                message: 'Đăng xuất thành công',
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                message: 'Lỗi server vui lòng thử lại sau :((',
            });
        }
    }

    async refreshToken(req, res) {
        try {
            const token =
                req.cookies?.[REFRESH_COOKIE_NAME] || req.body?.refreshToken;

            if (!token) {
                // Trả về 200 thay vì 401 khi không có token (chưa đăng nhập)
                return res.status(200).json({
                    message: 'Chưa đăng nhập',
                    authenticated: false,
                });
            }

            let decoded = null;
            try {
                decoded = jwt.verify(token, REFRESH_TOKEN_SECRET);
            } catch (error) {
                return res.status(200).json({
                    message: 'Refresh token không hợp lệ hoặc đã hết hạn',
                    authenticated: false,
                });
            }

            const user = await User.findById(decoded.id);

            if (!user || user.refreshToken !== token) {
                return res.status(200).json({
                    message: 'Refresh token không hợp lệ',
                    authenticated: false,
                });
            }

            const newAccessToken = this.generateAccessToken(user);
            const newRefreshToken = this.generateRefreshToken(user);

            user.refreshToken = newRefreshToken;
            await user.save();

            this.setRefreshTokenCookie(res, newRefreshToken);

            return res.status(200).json({
                message: 'Làm mới token thành công',
                accessToken: newAccessToken,
                user: buildUserPayload(user),
                authenticated: true,
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                message: 'Lỗi server vui lòng thử lại sau :((',
            });
        }
    }

    async verifyToken(req, res) {
        try {
            const token = this.extractAccessToken(req);

            if (!token) {
                return res.status(401).json({
                    message: 'Thiếu access token',
                });
            }

            let decoded = null;
            try {
                decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
            } catch (error) {
                return res.status(401).json({
                    message: 'Access token không hợp lệ',
                });
            }

            const user = await User.findById(decoded.id).lean();

            if (!user) {
                return res.status(404).json({
                    message: 'Không tìm thấy người dùng',
                });
            }

            return res.status(200).json({
                valid: true,
                user: buildUserPayload(user),
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                message: 'Lỗi server vui lòng thử lại sau :((',
            });
        }
    }

    async getMe(req, res) {
        try {
            const token = this.extractAccessToken(req);

            if (!token) {
                return res.status(401).json({
                    message: 'Thiếu access token',
                    authenticated: false,
                });
            }

            let decoded = null;
            try {
                decoded = jwt.verify(token, ACCESS_TOKEN_SECRET);
            } catch (error) {
                // Nếu token hết hạn, thử refresh token
                const refreshToken =
                    req.cookies?.[REFRESH_COOKIE_NAME] || req.body?.refreshToken;

                if (refreshToken) {
                    try {
                        const refreshDecoded = jwt.verify(
                            refreshToken,
                            REFRESH_TOKEN_SECRET,
                        );
                        const user = await User.findById(refreshDecoded.id);

                        if (user && user.refreshToken === refreshToken) {
                            // Tạo access token mới
                            const newAccessToken = this.generateAccessToken(user);
                            return res.status(200).json({
                                message: 'Token đã được làm mới',
                                accessToken: newAccessToken,
                                user: buildUserPayload(user),
                                authenticated: true,
                            });
                        }
                    } catch (refreshError) {
                        // Refresh token cũng không hợp lệ
                    }
                }

                return res.status(401).json({
                    message: 'Access token không hợp lệ hoặc đã hết hạn',
                    authenticated: false,
                });
            }

            const user = await User.findById(decoded.id).lean();

            if (!user) {
                return res.status(404).json({
                    message: 'Không tìm thấy người dùng',
                    authenticated: false,
                });
            }

            return res.status(200).json({
                message: 'Lấy thông tin user thành công',
                user: buildUserPayload(user),
                authenticated: true,
            });
        } catch (error) {
            console.log(error);
            return res.status(500).json({
                message: 'Lỗi server vui lòng thử lại sau :((',
                authenticated: false,
            });
        }
    }
}

module.exports = new AuthenticationController();
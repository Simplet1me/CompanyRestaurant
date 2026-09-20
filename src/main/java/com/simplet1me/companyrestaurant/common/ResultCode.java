package com.simplet1me.companyrestaurant.common;

/**
 * 统一响应码
 */
public final class ResultCode {

    /** 成功 */
    public static final int SUCCESS = 200;

    /** 参数错误 / 业务规则不满足 */
    public static final int BAD_REQUEST = 400;

    /** 未登录 */
    public static final int UNAUTHORIZED = 401;

    /** 无权限 */
    public static final int FORBIDDEN = 403;

    /** 服务器错误 */
    public static final int SERVER_ERROR = 500;

    private ResultCode() {
    }
}

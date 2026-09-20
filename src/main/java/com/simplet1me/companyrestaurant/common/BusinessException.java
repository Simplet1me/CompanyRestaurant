package com.simplet1me.companyrestaurant.common;

import lombok.Getter;

/**
 * 业务异常：由全局异常处理器统一转为 Result 响应
 */
@Getter
public class BusinessException extends RuntimeException {

    /** 响应码，默认 400 */
    private final int code;

    public BusinessException(String message) {
        this(ResultCode.BAD_REQUEST, message);
    }

    public BusinessException(int code, String message) {
        super(message);
        this.code = code;
    }
}

package com.simplet1me.companyrestaurant.common;

import lombok.Data;

/**
 * 统一响应体 {code, msg, data}
 */
@Data
public class Result<T> {

    private Integer code;

    private String msg;

    private T data;

    public static <T> Result<T> success(T data) {
        Result<T> result = new Result<>();
        result.setCode(ResultCode.SUCCESS);
        result.setMsg("ok");
        result.setData(data);
        return result;
    }

    public static <T> Result<T> success() {
        return success(null);
    }

    public static <T> Result<T> error(int code, String msg) {
        Result<T> result = new Result<>();
        result.setCode(code);
        result.setMsg(msg);
        return result;
    }
}

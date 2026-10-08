package com.simplet1me.companyrestaurant.common;

import lombok.Data;

import java.util.List;

/**
 * 分页结果 {total, list}
 */
@Data
public class PageResult<T> {

    /** 总记录数 */
    private long total;

    /** 当前页数据 */
    private List<T> list;

    public static <T> PageResult<T> of(long total, List<T> list) {
        PageResult<T> page = new PageResult<>();
        page.setTotal(total);
        page.setList(list);
        return page;
    }
}

package com.simplet1me.companyrestaurant.model.vo;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

/**
 * 总括订单视图（厨房主管备料汇总）
 */
@Data
public class BlanketOrderVO {

    /** 用餐日期 */
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate mealDate;

    /** 订餐员工数 */
    private Long totalEmployeeCount;

    /** 按菜名+单位汇总的分量清单 */
    private List<ReportItemVO> items;
}

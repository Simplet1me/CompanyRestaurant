package com.simplet1me.companyrestaurant.mapper;

import com.simplet1me.companyrestaurant.entity.Order;
import org.apache.ibatis.annotations.Param;

import java.time.LocalDate;
import java.util.List;

/**
 * 订单表 Mapper
 */
public interface OrderMapper {

    Order findById(@Param("id") Long id);

    /** 唯一性预检：某用户某用餐日期是否已有订单 */
    Order findByUserIdAndMealDate(@Param("userId") Long userId, @Param("mealDate") LocalDate mealDate);

    /** 分页查询（userId、mealDate 均可选） */
    List<Order> pageList(@Param("userId") Long userId, @Param("mealDate") LocalDate mealDate,
                         @Param("offset") int offset, @Param("size") int size);

    long countByCond(@Param("userId") Long userId, @Param("mealDate") LocalDate mealDate);

    /** 按用餐日期区间查询（报表/汇总用，userId 可选） */
    List<Order> findByMealDateRange(@Param("userId") Long userId,
                                    @Param("start") LocalDate start, @Param("end") LocalDate end);

    /** 某用户有效订单数（删除用户前检查） */
    long countValidByUserId(@Param("userId") Long userId);

    /** 某用餐日期全部订单（配餐批量打印） */
    List<Order> findByMealDate(@Param("mealDate") LocalDate mealDate);

    int insert(Order order);

    int deleteById(@Param("id") Long id);
}

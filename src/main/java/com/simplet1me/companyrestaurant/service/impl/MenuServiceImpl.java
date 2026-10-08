package com.simplet1me.companyrestaurant.service.impl;

import com.simplet1me.companyrestaurant.common.BusinessException;
import com.simplet1me.companyrestaurant.common.PageResult;
import com.simplet1me.companyrestaurant.entity.Menu;
import com.simplet1me.companyrestaurant.entity.MenuItem;
import com.simplet1me.companyrestaurant.entity.Recipe;
import com.simplet1me.companyrestaurant.mapper.MenuItemMapper;
import com.simplet1me.companyrestaurant.mapper.MenuMapper;
import com.simplet1me.companyrestaurant.mapper.RecipeMapper;
import com.simplet1me.companyrestaurant.model.dto.MenuCreateDTO;
import com.simplet1me.companyrestaurant.model.vo.MenuVO;
import com.simplet1me.companyrestaurant.service.MenuService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 菜单管理服务实现。
 * 菜单菜品为食谱快照：创建/加菜时复制，此后与食谱解耦，价格可独立修改。
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class MenuServiceImpl implements MenuService {

    private final MenuMapper menuMapper;

    private final MenuItemMapper menuItemMapper;

    private final RecipeMapper recipeMapper;

    @Override
    public PageResult<Menu> pageList(int pageNum, int pageSize) {
        pageNum = Math.max(pageNum, 1);
        pageSize = Math.min(Math.max(pageSize, 1), 100);
        int offset = (pageNum - 1) * pageSize;
        long total = menuMapper.countAll();
        List<Menu> list = menuMapper.pageList(offset, pageSize);
        return PageResult.of(total, list);
    }

    @Override
    public MenuVO current() {
        Menu menu = menuMapper.findByStatus(Menu.STATUS_USE);
        return menu == null ? null : toVO(menu);
    }

    @Override
    public MenuVO getDetail(Long id) {
        return toVO(requireMenu(id));
    }

    @Override
    @Transactional
    public MenuVO create(MenuCreateDTO dto) {
        // 更换菜单：旧使用中菜单转历史，新菜单即启用
        menuMapper.updateStatusWhereUse(Menu.STATUS_HISTORY);

        Menu menu = new Menu();
        menu.setName(dto.getName());
        menu.setStatus(Menu.STATUS_USE);
        menuMapper.insert(menu);

        snapshotItems(menu.getId(), dto.getRecipeIds());
        log.info("创建并启用菜单: id={}, name={}, 菜品数={}", menu.getId(), menu.getName(), dto.getRecipeIds().size());
        return toVO(menu);
    }

    @Override
    @Transactional
    public MenuVO addItems(Long menuId, List<Long> recipeIds) {
        Menu menu = requireMenu(menuId);
        // 已存在（按来源食谱 id 判断）的菜品跳过，避免重复加菜
        Set<Long> existingRecipeIds = menuItemMapper.findByMenuId(menuId).stream()
                .map(MenuItem::getRecipeId)
                .filter(java.util.Objects::nonNull)
                .collect(Collectors.toSet());
        List<Long> toAdd = recipeIds.stream()
                .filter(id -> !existingRecipeIds.contains(id))
                .toList();
        if (!toAdd.isEmpty()) {
            snapshotItems(menuId, toAdd);
        }
        return toVO(menu);
    }

    @Override
    public void updateItemPrice(Long itemId, BigDecimal price) {
        MenuItem item = requireItem(itemId);
        menuItemMapper.updatePrice(itemId, price);
        log.info("修改菜单菜品价格: itemId={}, {} -> {}", itemId, item.getPrice(), price);
    }

    @Override
    public void deleteItem(Long itemId) {
        requireItem(itemId);
        menuItemMapper.deleteById(itemId);
        log.info("删除菜单菜品: itemId={}", itemId);
    }

    @Override
    @Transactional
    public void deleteMenu(Long id) {
        Menu menu = requireMenu(id);
        if (Menu.STATUS_USE.equals(menu.getStatus())) {
            throw new BusinessException("使用中的菜单不可删除，请先启用新菜单");
        }
        menuItemMapper.deleteByMenuId(id);
        menuMapper.deleteById(id);
        log.info("删除菜单: id={}, name={}", id, menu.getName());
    }

    @Override
    @Transactional
    public MenuVO activate(Long id) {
        Menu menu = requireMenu(id);
        menuMapper.updateStatusWhereUse(Menu.STATUS_HISTORY);
        menuMapper.updateStatusById(id, Menu.STATUS_USE);
        menu.setStatus(Menu.STATUS_USE);
        log.info("启用菜单: id={}, name={}", id, menu.getName());
        return toVO(menu);
    }

    /** 从食谱快照复制菜品到菜单 */
    private void snapshotItems(Long menuId, List<Long> recipeIds) {
        List<MenuItem> items = recipeIds.stream().map(recipeId -> {
            Recipe recipe = recipeMapper.findById(recipeId);
            if (recipe == null) {
                throw new BusinessException("食谱菜品不存在: id=" + recipeId);
            }
            MenuItem item = new MenuItem();
            item.setMenuId(menuId);
            item.setRecipeId(recipe.getId());
            item.setName(recipe.getName());
            item.setPhoto(recipe.getPhoto());
            item.setUnit(recipe.getUnit());
            item.setClassify(recipe.getClassify());
            item.setPrice(recipe.getPrice());
            return item;
        }).toList();
        menuItemMapper.insertBatch(items);
    }

    private Menu requireMenu(Long id) {
        Menu menu = menuMapper.findById(id);
        if (menu == null) {
            throw new BusinessException("菜单不存在");
        }
        return menu;
    }

    private MenuItem requireItem(Long id) {
        MenuItem item = menuItemMapper.findById(id);
        if (item == null) {
            throw new BusinessException("菜单菜品不存在");
        }
        return item;
    }

    private MenuVO toVO(Menu menu) {
        MenuVO vo = new MenuVO();
        vo.setId(menu.getId());
        vo.setName(menu.getName());
        vo.setStatus(menu.getStatus());
        vo.setCreateTime(menu.getCreateTime());
        vo.setItems(menuItemMapper.findByMenuId(menu.getId()));
        return vo;
    }
}

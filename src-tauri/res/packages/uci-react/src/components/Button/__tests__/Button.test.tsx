import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { composeStories } from 'storybook-react-rsbuild';
import * as stories from '../../../../stories/Button.stories';
import { Button } from '../index';

const { Basic, Primary, Types, Sizes, Status, Disabled, Loading, Danger } = composeStories(stories);

describe('Button', () => {
  describe('基础渲染', () => {
    it('应该正确渲染基础按钮', () => {
      render(<Basic />);
      const button = screen.getByRole('button', { name: '基础按钮' });
      expect(button).toBeTruthy();
    });

    it('应该正确传递 className 属性', () => {
      const { container } = render(<Button className="custom-class">测试按钮</Button>);
      const button = container.querySelector('.custom-class');
      expect(button).toBeTruthy();
    });
  });

  describe('按钮类型', () => {
    it('应该正确渲染 primary 类型按钮', () => {
      render(<Primary />);
      const button = screen.getByRole('button', { name: '主要按钮' });
      expect(button).toBeTruthy();
    });

    it('应该正确渲染多种类型按钮', () => {
      const { container } = render(<Types />);
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBe(5);
      expect(buttons[0]?.textContent).toBe('Primary');
      expect(buttons[1]?.textContent).toBe('Secondary');
      expect(buttons[2]?.textContent).toBe('Dashed');
      expect(buttons[3]?.textContent).toBe('Outline');
      expect(buttons[4]?.textContent).toBe('Text');
    });
  });

  describe('按钮尺寸', () => {
    it('应该正确渲染多种尺寸按钮', () => {
      const { container } = render(<Sizes />);
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBe(4);
      expect(buttons[0]?.textContent).toBe('Mini');
      expect(buttons[1]?.textContent).toBe('Small');
      expect(buttons[2]?.textContent).toBe('Default');
      expect(buttons[3]?.textContent).toBe('Large');
    });
  });

  describe('按钮状态', () => {
    it('应该正确渲染多种状态按钮', () => {
      const { container } = render(<Status />);
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBe(4);
      expect(buttons[0]?.textContent).toBe('Default');
      expect(buttons[1]?.textContent).toBe('Warning');
      expect(buttons[2]?.textContent).toBe('Success');
      expect(buttons[3]?.textContent).toBe('Danger');
    });
  });

  describe('禁用状态', () => {
    it('应该正确渲染禁用按钮', () => {
      render(<Disabled />);
      const button = screen.getByRole('button', { name: '禁用按钮' });
      expect(button.getAttribute('disabled')).not.toBeNull();
    });

    it('禁用按钮不应该触发点击事件', () => {
      const handleClick = vi.fn();
      render(<Disabled onClick={handleClick} />);
      const button = screen.getByRole('button', { name: '禁用按钮' });
      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('加载状态', () => {
    it('应该正确渲染加载状态按钮', () => {
      render(<Loading />);
      const button = screen.getByRole('button', { name: '加载中' });
      expect(button).toBeTruthy();
    });

    it('加载状态时按钮应该被禁用', () => {
      render(<Loading />);
      const button = screen.getByRole('button', { name: '加载中' });
      expect(button.getAttribute('disabled')).not.toBeNull();
    });

    it('加载状态按钮不应该触发点击事件', () => {
      const handleClick = vi.fn();
      render(<Loading onClick={handleClick} />);
      const button = screen.getByRole('button', { name: '加载中' });
      fireEvent.click(button);
      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('点击事件', () => {
    it('应该正确触发点击事件', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>点击按钮</Button>);
      const button = screen.getByRole('button', { name: '点击按钮' });
      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('应该支持多次点击', () => {
      const handleClick = vi.fn();
      render(<Button onClick={handleClick}>点击按钮</Button>);
      const button = screen.getByRole('button', { name: '点击按钮' });
      fireEvent.click(button);
      fireEvent.click(button);
      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(3);
    });
  });

  describe('组合状态', () => {
    it('应该正确组合 type 和 status', () => {
      render(<Danger />);
      const button = screen.getByRole('button', { name: '删除' });
      expect(button).toBeTruthy();
    });

    it('应该正确组合所有属性', () => {
      const { container } = render(
        <Button
          type="primary"
          size="large"
          status="success"
          className="test-class"
        >
          完整按钮
        </Button>
      );
      const button = container.querySelector('.test-class');
      expect(button).toBeTruthy();
    });
  });

  describe('边界情况', () => {
    it('应该正确处理复杂的子元素', () => {
      const { container } = render(
        <Button>
          <span>复杂</span>
          <strong>内容</strong>
        </Button>
      );
      const button = container.querySelector('button');
      expect(button?.textContent).toContain('复杂内容');
    });
  });
});
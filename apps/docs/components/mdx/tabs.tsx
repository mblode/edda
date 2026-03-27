"use client";

import cx from "clsx";
import { isValidElement, useCallback, useMemo, useState } from "react";
import type { MouseEvent, ReactElement, ReactNode } from "react";

interface TabProps {
  label: string;
  children: ReactNode;
}

export const Tab = ({ children }: TabProps) => (
  <div className="tabs__panel">{children}</div>
);

export const Tabs = ({ children }: { children: ReactNode }) => {
  const items = useMemo(() => {
    const nodes = Array.isArray(children) ? children : [children];
    return nodes.filter((child): child is ReactElement<TabProps> =>
      isValidElement<TabProps>(child)
    );
  }, [children]);

  const [active, setActive] = useState(0);
  const activeItem = items[active];
  const handleTabClick = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    const index = Number(event.currentTarget.dataset.index ?? "0");
    setActive(index);
  }, []);

  if (!items.length) {
    return null;
  }

  return (
    <div className="tabs">
      <div className="tabs__list" role="tablist">
        {items.map((item, index) => (
          <button
            aria-selected={index === active}
            className={cx("tabs__trigger", {
              "tabs__trigger--active": index === active,
            })}
            data-index={index}
            key={String(item.key ?? item.props.label)}
            onClick={handleTabClick}
            role="tab"
            type="button"
          >
            {item.props.label}
          </button>
        ))}
      </div>
      <div className="tabs__content" role="tabpanel">
        {activeItem}
      </div>
    </div>
  );
};

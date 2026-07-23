"use client";

export default function AskTrigger({ message, as: Tag = "span", className, children, onClick, ...props }) {
  return (
    <Tag
      onClick={(e) => {
        onClick?.(e);
        window.$cgpt?.push(["do", "message:send", message]);
      }}
      className={className}
      {...props}
    >
      {children}
    </Tag>
  );
}

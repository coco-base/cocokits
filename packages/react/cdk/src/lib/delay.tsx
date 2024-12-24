import { useEffect, useState } from "react";

export interface DelayProps {
  time: number;
  children: React.ReactNode | React.ReactNode[];
}

export function Delay({time, children}: DelayProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShow(true);
    }, time);
    return () => clearTimeout(timer);
  }, [time]);

  return show ? children : null;

}
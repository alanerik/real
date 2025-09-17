import {Chip} from "@heroui/react";

export default function app({ text, color = "primary" }) {
  return (
    <Chip color={color}>
      {text}
    </Chip>
  );
}

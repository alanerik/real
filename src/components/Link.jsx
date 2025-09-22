import {Link, Button} from "@heroui/react";

export default function LinkComponent({ href = "#", children, color = "success", ...props }) {
  return (
     
    <Button
    showAnchorIcon
      as={Link}
      color={color}
      href={href}
      variant="solid"
      isBlock
    className=" mb-3 mr-1"
      {...props}
    >
      {children}
    </Button>
  
  );
}



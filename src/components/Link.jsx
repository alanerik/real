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
    
      {...props}
    >
      {children}
    </Button>
  
  );
}



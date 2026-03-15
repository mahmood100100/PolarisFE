import Link from "next/link";
import { Button } from "../../ui/button";
import { cn } from "@/lib/utils";

interface BackButtonProps {
  href: string;
  label: string;
  className? : string | null;
}
const BackButton = ({href , label , className} : BackButtonProps) => {
  return (
    <Button 
      variant="link" 
      className={cn("font-normal text-zinc-400 hover:text-white transition-all", className)} 
      size="sm" 
      asChild
    >
      <Link href={href}>
         {label}
      </Link>
    </Button>
  )
}


export default BackButton
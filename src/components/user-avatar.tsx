import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils";

interface UserAvatarProps {
    src?: string;
    className?: string;
    fallback?: string;
}

const UserAvatar = ({ src, className, fallback = "U" }: UserAvatarProps) => {
  return (
    <Avatar className={cn(
        "h-7 w-7 md:h-10 md:w-10", className
    )}>
        <AvatarImage src={src} />
        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-semibold text-[10px] md:text-sm">
            {fallback}
        </AvatarFallback>
    </Avatar>
  )
}

export default UserAvatar
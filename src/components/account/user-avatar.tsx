import { cn } from "@/lib/utils";
import type { UserProfile } from "@/lib/account";
import { displayName, initials } from "@/lib/account";

type Props = {
  profile: UserProfile;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizeClasses = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-16 text-lg",
};

export function UserAvatar({ profile, size = "md", className }: Props) {
  const label = displayName(profile);

  if (profile.avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={profile.avatarUrl}
        alt={label}
        className={cn("rounded-full object-cover", sizeClasses[size], className)}
      />
    );
  }

  return (
    <div
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-primary/10 font-medium text-primary",
        sizeClasses[size],
        className
      )}
    >
      {initials(profile)}
    </div>
  );
}

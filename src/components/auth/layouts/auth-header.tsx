interface AuthHeaderProps {
    label : string;
    title: string;
    className: string;
}
const AuthHeader = ({label , title , className} : AuthHeaderProps) => {
  return (
    <div className= {`w-full flex flex-col gap-y-4 items-center justify-center ${className}`}>
        <div className="w-12 h-12 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center mb-2 shadow-2xl">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
              />
            </svg>
        </div>
        <div className="flex flex-col items-center gap-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-white">{title}</h1>
            <p className="text-sm text-zinc-400 font-medium">{label}</p>
        </div>
    </div>
  )
}


export default AuthHeader
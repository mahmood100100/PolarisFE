"use client";

import {
    Card,
    CardContent,
    CardHeader,
    CardFooter
} from '@/components/ui/card';
import AuthHeader from '@/components/auth/layouts/auth-header';
import BackButton from '@/components/auth/layouts/back-button';

interface CardWrapperProps {
    label: string;
    title: string;
    cardClassName?: string;
    cardContentClassName?: string;
    backButtonHref: string;
    backButtonLabel: string;
    children: React.ReactNode;
}

const CardWrapper = ({
    label,
    title,
    backButtonHref,
    backButtonLabel,
    cardClassName = '',
    cardContentClassName = '',
    children
}: CardWrapperProps) => {
    return (
        <Card className={`xl:w-[450px] lg:w-[450px] md:w-6/12 sm:w-7/12 w-full bg-[#0d0d0d] text-white rounded-2xl border border-white/10 shadow-[0_0_50px_-12px_rgba(255,255,255,0.1)] backdrop-blur-sm ${cardClassName}`}>
            <CardHeader className="p-8 pb-0 border-none text-center">
                <AuthHeader label={label} title={title} className="" />
            </CardHeader>
            
            <CardContent className={`p-8 ${cardContentClassName}`}>
                {children}
            </CardContent>

            <CardFooter className="p-6 pt-0 flex justify-center border-none">
                <BackButton 
                    href={backButtonHref} 
                    label={backButtonLabel} 
                    className="text-zinc-500 hover:text-white transition-all duration-300 font-medium" 
                />
            </CardFooter>
        </Card>
    );

};

export default CardWrapper;

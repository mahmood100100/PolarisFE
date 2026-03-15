"use client"

import {
    Tooltip , 
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from '@/components/ui/tooltip'
import React from 'react';

interface ActionTooltipPrps {
    label : string;
    children : React.ReactNode;
    side?: "right" | "left" | "top" | "bottom";
    align? : "start" | "end" | "center"
}
const ActionTooltip = ({label , children , side , align} : ActionTooltipPrps) => {
  return (
    <TooltipProvider>
        <Tooltip delayDuration={50}>
            <TooltipTrigger asChild>
                {children}
            </TooltipTrigger>
            <TooltipContent side= {side} align= {align}>
                <p className='font-semibold text-sm capitalize'>
                    {label.toLowerCase()}
                </p>
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
  )
}

export default ActionTooltip
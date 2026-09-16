"use client";

import * as React from 'react';
import SecondaryButtonView, { ButtonProps } from "./SecondaryButtonView";

const SecondaryButton = React.forwardRef<HTMLButtonElement, ButtonProps>((props, ref) => {
    return <SecondaryButtonView ref={ref} {...props} />;
});

SecondaryButton.displayName = 'SecButton';

export default SecondaryButton;

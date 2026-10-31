"use client";
import {createContext} from 'react';
import type {WidgetEffect} from '@/lib/widgetAppearance';
export const WidgetMotionContext=createContext<WidgetEffect>('inherit');

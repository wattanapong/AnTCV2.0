'use client';

import React from 'react';
import { useState, useEffect } from "react";
import { useAuthStore } from "@/store/authStore";

type Props = {
  data: any; // Better to define a type here
};

export default function MyClientComponent({ data }: Props) {
//     const { username, fetchUsername } = useAuthStore();
    
//     useEffect(() => {
//     if (!username) {
//       fetchUsername();
//     }
//   }, [username, fetchUsername]);

  return (
    <div>
      There are {data.images} images, {data.classes} classes.
    </div>
  );
}

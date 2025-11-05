'use client';

import { DotLottieReact } from '@lottiefiles/dotlottie-react';

export default function BookLoadingAnimation() {
  return (
    <div className="flex items-center justify-center">
      <DotLottieReact
        src="/animations/loading.lottie"
        loop
        autoplay
        style={{ width: '240px', height: '240px' }}
      />
    </div>
  );
}

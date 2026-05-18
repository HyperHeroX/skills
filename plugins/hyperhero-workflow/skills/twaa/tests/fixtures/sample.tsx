import React from 'react';

export function App() {
  return (
    <div>
      <img src="/x.png" />
      <img src="/y.png" alt="" />
      <div role="button" onClick={() => {}}>點我</div>
      <input dangerouslySetInnerHTML={{ __html: '<script>alert(1)</script>' }} />
    </div>
  );
}

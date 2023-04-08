import React, { useEffect, useRef, useState } from 'react';

import { Input } from '@chakra-ui/react';

// For reasons that I'm not 100% sure, using a normal input in BangInfo causes the cursor
// to jump to the end when editing the middle of it. It's to do with state causing the
// input to be replaced, and React not knowing where to put the cursor in a "new" input.
// It seems to be a relatively regular problem that people have, so I'm happy to just use this.
// This solves the problem by wrapping Chakras Input and using state and ref to remember
// the cursor position.
// The types & linting are suppressed because I know this works and I CBA to figure it out.
// Taken & edited from https://stackoverflow.com/a/68928267/6396652.
export default function ControlledInput(props: any) {
  const { value, onChange, ...rest } = props;
  const [cursor, setCursor] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    const input: any = ref.current;
    if (input) input.setSelectionRange(cursor, cursor);
  }, [ref, cursor, value]);

  const handleChange = (e: any) => {
    setCursor(e.target.selectionStart);
    if (onChange) onChange(e);
  };

  // eslint-disable-next-line react/jsx-props-no-spreading
  return <Input ref={ref} value={value} onChange={handleChange} {...rest} />;
}

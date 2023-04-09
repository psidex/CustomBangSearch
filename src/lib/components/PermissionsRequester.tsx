import React, { useState, useEffect } from 'react';

import { Button } from '@chakra-ui/react';

import browser from 'webextension-polyfill';

import { hostPermissions } from '../esbuilddefinitions';

const requestedPermissions = { origins: hostPermissions };

type PropTypes = {
  closeWindow: boolean,
};

export default function PermissionsRequester(props: PropTypes): React.ReactElement | null {
  const [hasPermissions, setHasPermissions] = useState<boolean>(false);

  const { closeWindow } = props;

  useEffect(() => {
    (async () => {
      const has = await browser.permissions.contains(requestedPermissions);
      if (has) {
        setHasPermissions(true);
      }
    })();
  }, []);

  const clicked = () => {
    browser.permissions.request(requestedPermissions).then(() => {
      window.location.reload();
    });
    if (closeWindow === true) {
      window.close();
    }
  };

  if (hasPermissions) {
    return null;
  }

  return (
    <Button
      variant="solid"
      colorScheme="red"
      onClick={clicked}
    >
      Enable Required Permissions
    </Button>
  );
}

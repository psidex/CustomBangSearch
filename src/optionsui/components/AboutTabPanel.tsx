import React from 'react';

import {
  TabPanel, Text, Heading, Code, Link,
} from '@chakra-ui/react';

/* eslint-disable max-len */

export default function AboutTabPanel(): React.ReactElement {
  return (
    <TabPanel>
      <Text fontSize="lg">
        Custom Bang Search is a browser extension to use custom DuckDuckGo-like bangs
        directly from the address bar.
      </Text>
      <Text fontSize="lg">
        See a much more detailed version of this page on
        {' '}
        <Link isExternal color="teal.500" href="https://github.com/psidex/CustomBangSearch">GitHub</Link>
        .
      </Text>
      <Heading size="md" marginTop="2rem">Search Engines</Heading>
      <Text fontSize="lg">
        <Link isExternal color="teal.500" href="https://github.com/psidex/CustomBangSearch/blob/master/docs/supported-engines.md">These search engines are tested and officially supported</Link>
        .
      </Text>
      <Text fontSize="lg">If you set one of these as your browsers search engine, you can use the bangs directly in the search bar.</Text>
      <Text fontSize="lg">Bangs will also work by just using the search engines normally.</Text>
      <Heading size="md" marginTop="2rem">Options Page</Heading>
      <Text fontSize="lg">All of your bangs and options are saved to the browsers sync storage, meaning if you log into your browser they will sync across to wherever else you are logged in.</Text>
      <Text fontSize="lg">
        This storage has a strict quota, and you can see the amount of it you are using at the top of the options page.
      </Text>
      <Heading size="sm" marginTop="1rem">Bangs</Heading>
      <Text fontSize="lg">Go to the options page to start creating custom bangs. This can be accessed through the extensions popup, or through your browsers extensions menu.</Text>
      <Text fontSize="lg">Each item in the list shows a bang, and a URL or set of URLs that will be opened when this bang is used.</Text>
      <Text fontSize="lg">Pressing the &quot;add bang&quot; button will add a new bang to the bottom of the list, which you can then edit.</Text>
      <Text fontSize="lg">The trash buttons on the left remove whole bangs, and the buttons on the right are for URLs.</Text>
      <Text fontSize="lg">
        Use
        {' '}
        <Code>%s</Code>
        {' '}
        in the URLs to show where you want your query to be inserted, take a look at the default bangs if you need some help understanding how to format things.
      </Text>
      <Text fontSize="lg"><em>Some of the default URLs including Amazon, Ebay, and Etsy are UK URLs, so change those if you need to!</em></Text>
      <Text fontSize="lg">You can also import and export your list of bangs to/from a valid JSON file.</Text>
      <Text fontSize="lg">If the save button is highlighted green, this means you have unsaved changes and they will not take effect until you press the save button.</Text>
      <Heading size="sm" marginTop="1rem">Options</Heading>
      <Text fontSize="lg">A options tab exists within the options page, which allows you to change the behaviour of the extension. Currently this is just the search engines that the extension is enabled to use bangs with.</Text>
      <Heading size="sm" marginTop="1rem">DuckDuckGo Bangs</Heading>
      <Text fontSize="lg">
        If you want to import bangs from DuckDuckGo, see
        {' '}
        <Link isExternal color="teal.500" href="https://github.com/psidex/CustomBangSearch/blob/master/ddg/README.md">this page</Link>
        .
      </Text>
      <Heading size="md" marginTop="2rem">Icon</Heading>
      <Text fontSize="lg">
        Created by
        {' '}
        <Link isExternal color="teal.500" href="https://www.flaticon.com/free-icon/exclamation-mark_4194667">apien on Flaticon</Link>
      </Text>
    </TabPanel>
  );
}

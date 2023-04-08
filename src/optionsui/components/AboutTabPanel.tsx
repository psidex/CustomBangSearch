import React from 'react';

import {
  TabPanel, Text as OGText, Heading as OGHeading, Code, Link as OGLink,
} from '@chakra-ui/react';

/* eslint-disable max-len */

function Text(props: any): React.ReactElement {
  const { children } = props;
  return <OGText fontSize="lg" marginBottom="0.5rem">{children}</OGText>;
}

function Link(props: any): React.ReactElement {
  const { href, children } = props;
  return <OGLink color="#0969da" href={href} isExternal>{children}</OGLink>;
}

function Heading(props: any): React.ReactElement {
  const { children } = props;
  return <OGHeading size="lg" marginTop="2rem" marginBottom="1rem" borderBottom="1px solid #00000030">{children}</OGHeading>;
}

function SubHeading(props: any): React.ReactElement {
  const { children } = props;
  return <OGHeading size="md" marginTop="1rem" marginBottom="1rem">{children}</OGHeading>;
}

export default function AboutTabPanel(): React.ReactElement {
  return (
    <TabPanel>
      <Heading>About</Heading>
      <Text>
        Custom Bang Search is a browser extension to use custom DuckDuckGo-like bangs
        directly from the address bar.
      </Text>
      <Text>
        See a much more detailed version of this page on
        {' '}
        <Link href="https://github.com/psidex/CustomBangSearch">GitHub</Link>
        .
      </Text>
      <Heading>Search Engines</Heading>
      <Text>
        <Link href="https://github.com/psidex/CustomBangSearch/blob/master/docs/supported-engines.md">These search engines are tested and officially supported</Link>
        .
      </Text>
      <Text>If you set one of these as your browsers search engine, you can use the bangs directly in the search bar.</Text>
      <Text>Bangs will also work by just using the search engines normally.</Text>
      <Heading>Options Page</Heading>
      <Text>All of your bangs and options are saved to the browsers sync storage, meaning if you log into your browser they will sync across to wherever else you are logged in.</Text>
      <Text>
        This storage has a strict quota, and you can see the amount of it you are using at the top of the options page.
      </Text>
      <SubHeading>Bangs</SubHeading>
      <Text>Go to the options page to start creating custom bangs. This can be accessed through the extensions popup, or through your browsers extensions menu.</Text>
      <Text>Each item in the list shows a bang, and a URL or set of URLs that will be opened when this bang is used.</Text>
      <Text>Pressing the &quot;add bang&quot; button will add a new bang to the bottom of the list, which you can then edit.</Text>
      <Text>The trash buttons on the left remove whole bangs, and the buttons on the right are for URLs.</Text>
      <Text>
        Use
        {' '}
        <Code>%s</Code>
        {' '}
        in the URLs to show where you want your query to be inserted, take a look at the default bangs if you need some help understanding how to format things.
      </Text>
      <Text><em>Some of the default URLs including Amazon, Ebay, and Etsy are UK URLs, so change those if you need to!</em></Text>
      <Text>You can also import and export your list of bangs to/from a valid JSON file.</Text>
      <Text>If the save button is highlighted green, this means you have unsaved changes and they will not take effect until you press the save button.</Text>
      <SubHeading>Options</SubHeading>
      <Text>An options tab exists within the options page, which allows you to change the behaviour of the extension.</Text>
      <Text>Currently this is just the search engines that the extension is enabled to use bangs with.</Text>
      <SubHeading>DuckDuckGo Bangs</SubHeading>
      <Text>
        If you want to import bangs from DuckDuckGo, see
        {' '}
        <Link href="https://github.com/psidex/CustomBangSearch/blob/master/ddg/README.md">this page</Link>
        .
      </Text>
      <Heading>Icon</Heading>
      <Text>
        Created by
        {' '}
        <Link href="https://www.flaticon.com/free-icon/exclamation-mark_4194667">apien on Flaticon</Link>
      </Text>
    </TabPanel>
  );
}

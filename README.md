# Tip Gate

A simple tip gate for any kind of content.

## How to set this up yourself

1. Clone the repo

`git clone https://github.com/tantodefi/grid-tip-gate`

2. Install dependencies

`yarn install`

3. Run the development server

`yarn dev`

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

Now we're in a nextjs app. First thing your going to want to do is change the `DEFAULT_ADDRESS` in the `components/LuksoProfile.tsx` file to your own address - this is the address that will receive the tips. You can also set the `MINIMUM_DONATION` to your desired minimum donation amount.

Then in the `LuksoProfile.tsx` file you can find this function:

```
 const ProtectedContent = () => (
        <div className="mt-8 p-6 bg-white rounded-lg shadow-lg max-w-2xl">
            <h2 className="text-2xl font-bold mb-4">🎉 Protected Content Unlocked!</h2>
            <p className="text-lg mb-4">Thank you for your support! Here's your exclusive content:</p>
            <div className="prose">
                <h3 className="text-xl font-semibold mb-2">Special Access Content</h3>
                <p>Be early to <a href="https://basedup.world/" className="text-blue-500">basedup.world 🔵</a></p>
                <ul className="list-disc pl-5 mt-2">
                    <li>web3 events map</li>
                    <li>list items for sale</li>
                    <li>geoNFTs</li>
                    <li>smartwallet</li>
                </ul>
            </div>
        </div>
    );
```

This is the content that will be displayed to the user if they have tipped the minimum amount. You can change this to whatever you want.

Once you do that, you can deploy and link your app to the Grid on [universaleverything.io](https://universaleverything.io).

### Mini-App next.js template

A template project demonstrating how to build mini-apps using the [up-provider package](https://github.com/lukso-network/tools-up-provider) and interacting with Universal Profiles on [Universal Everything](https://universaleverything.io), built with [next.js](https://nextjs.org).

## Overview

This template showcases:
- [UP-Provider](https://github.com/lukso-network/tools-up-provider) implementation and wallet connection on the Grid
- Profile search functionality using Envio integration for fast querying
- Integrates the [@lukso/web-components](https://www.npmjs.com/package/@lukso/web-components) library for ready-to-use branded components
- Uses the [erc725js](https://docs.lukso.tech/tools/dapps/erc725js/getting-started) library to fetch profile data from the blockchain

## Key Features

### UP-Provider Integration
The template demonstrates how to:
- Connect to Universal Profile browser extension from the Grid
- Manage UP contexts on the Grid

### Envio Integration
Shows how to:
- Query the LUKSO Envio indexer
- Search for Universal Profiles
- Display profile information and images

### Web Components
Shows how to:
- Use the [@lukso/web-components](https://www.npmjs.com/package/@lukso/web-components) library to display profile card

### ERC-725.js
Shows how to:
- Use the [erc725js](https://docs.lukso.tech/tools/dapps/erc725js/getting-started) library to fetch profile data from the blockchain

## Getting Started

1. Install dependencies:
```bash
yarn install
```
2. Run the development server:
```bash
yarn dev
```

3. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.(Note that the Grid context is not available in the local environment)

## Project Structure

- `components/upProvider.tsx`: Core UP Provider implementation and wallet connection logic
- `components/ProfileSearch.tsx`: Example of Envio integration for profile search
- `components/Donate.tsx`: Example use-case of this template. Uses the client from the up-provider package to interact with the blockchain
- `components/LuksoProfile.tsx`: Example of using the [@lukso/web-components](https://www.npmjs.com/package/@lukso/web-components) library to display profile images that is fetched using the [erc725js](https://docs.lukso.tech/tools/dapps/erc725js/getting-started) library

## Learn More

- [LUKSO Documentation](https://docs.lukso.tech/) - Learn more about developing on LUKSO
- [UP Browser Extension](https://docs.lukso.tech/install-up-browser-extension) - Install the Universal Profile Browser Extension
- [erc725js](https://docs.lukso.tech/tools/dapps/erc725js/getting-started) - Learn more about the erc725js library 
- [@lukso/web-components](https://www.npmjs.com/package/@lukso/web-components) - Learn more about the @lukso/web-components library


## Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

import fs from 'fs';
import path from 'path';

export interface ERC20TemplateOptions {
  name: string;
  symbol: string;
  initialSupply?: string;
  maxSupply?: string;
}

export interface ERC721TemplateOptions {
  name: string;
  symbol: string;
  maxSupply?: string;
  mintPrice?: string;
  baseURI?: string;
}

export interface Web3ProjectOptions {
  projectName: string;
  projectType: 'erc20' | 'erc721' | 'dapp' | 'minimal';
  useHardhat?: boolean;
  useReact?: boolean;
  erc20Options?: ERC20TemplateOptions;
  erc721Options?: ERC721TemplateOptions;
}

/**
 * Creates a new Web3 project based on the provided options
 * @param options Project configuration options
 * @returns Array of files to be created
 */
export function createWeb3Project(options: Web3ProjectOptions) {
  const { 
    projectName,
    projectType,
    useHardhat = true,
    useReact = true,
    erc20Options,
    erc721Options
  } = options;
  
  const files: { path: string; content: string }[] = [];
  
  // Create project structure
  if (useHardhat) {
    // Add hardhat configuration directly instead of using hardhat init
    const hardhatConfig = `/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.20",
  paths: {
    artifacts: './artifacts',
    cache: './cache',
    sources: './contracts',
    tests: './test',
  },
  networks: {
    hardhat: {
      chainId: 31337
    }
  }
};`;

    files.push({
      path: path.join(projectName, 'hardhat.config.js'),
      content: hardhatConfig
    });
    
    // Add package.json for Hardhat
    const packageJson = {
      name: projectName.toLowerCase().replace(/\s+/g, '-'),
      version: '1.0.0',
      description: `${projectName} - A Web3 project`,
      scripts: {
        test: 'hardhat test',
        compile: 'hardhat compile',
        deploy: 'hardhat run scripts/deploy.js --network localhost',
        node: 'hardhat node'
      },
      dependencies: {
        '@openzeppelin/contracts': '^5.3.0'
      },
      devDependencies: {
        hardhat: '^2.23.0',
        '@nomicfoundation/hardhat-toolbox': '^3.0.0',
        'ethers': '^6.13.5'
      }
    };
    
    files.push({
      path: path.join(projectName, 'package.json'),
      content: JSON.stringify(packageJson, null, 2)
    });
    
    // Create basic project structure
    files.push({
      path: path.join(projectName, 'contracts', '.gitkeep'),
      content: ''
    });
    
    files.push({
      path: path.join(projectName, 'scripts', '.gitkeep'),
      content: ''
    });
    
    files.push({
      path: path.join(projectName, 'test', '.gitkeep'),
      content: ''
    });
    
    // Add contract based on project type
    if (projectType === 'erc20' && erc20Options) {
      const erc20Template = getTemplateContent('erc20.sol.template');
      const erc20Content = erc20Template
        .replace(/\{\{name\}\}/g, erc20Options.name)
        .replace(/\{\{symbol\}\}/g, erc20Options.symbol);
      
      files.push({
        path: path.join(projectName, 'contracts', `${erc20Options.name}.sol`),
        content: erc20Content
      });
      
      // Add deployment script
      const deployScript = `
async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contract with account:", deployer.address);

  const initialSupply = ${erc20Options.initialSupply || '1000000'};
  const maxSupply = ${erc20Options.maxSupply || '10000000'};
  
  const token = await ethers.deployContract("${erc20Options.name}", [initialSupply, maxSupply]);
  await token.waitForDeployment();
  
  console.log("Token deployed to:", await token.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
`;
      
      files.push({
        path: path.join(projectName, 'scripts', 'deploy.js'),
        content: deployScript
      });
      
    } else if (projectType === 'erc721' && erc721Options) {
      const erc721Template = getTemplateContent('erc721.sol.template');
      const erc721Content = erc721Template
        .replace(/\{\{name\}\}/g, erc721Options.name)
        .replace(/\{\{symbol\}\}/g, erc721Options.symbol)
        .replace(/\{\{maxSupply\}\}/g, erc721Options.maxSupply || '10000')
        .replace(/\{\{mintPrice\}\}/g, erc721Options.mintPrice || '10000000000000000') // 0.01 ETH
        .replace(/\{\{baseURI\}\}/g, erc721Options.baseURI || 'https://example.com/metadata/');
      
      files.push({
        path: path.join(projectName, 'contracts', `${erc721Options.name}.sol`),
        content: erc721Content
      });
      
      // Add deployment script
      const deployScript = `
async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contract with account:", deployer.address);
  
  const nft = await ethers.deployContract("${erc721Options.name}");
  await nft.waitForDeployment();
  
  console.log("NFT contract deployed to:", await nft.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
`;
      
      files.push({
        path: path.join(projectName, 'scripts', 'deploy.js'),
        content: deployScript
      });
    }
  }
  
  // Create frontend with React if selected
  if (useReact) {
    const reactPackageJson = {
      name: `${projectName.toLowerCase().replace(/\s+/g, '-')}-frontend`,
      private: true,
      version: '0.1.0',
      scripts: {
        dev: 'vite',
        build: 'vite build',
        preview: 'vite preview'
      },
      dependencies: {
        'ethers': '^6.13.5',
        'react': '^18.2.0',
        'react-dom': '^18.2.0',
        'viem': '^2.26.3',
        'wagmi': '^2.14.16'
      },
      devDependencies: {
        '@types/react': '^18.2.15',
        '@types/react-dom': '^18.2.7',
        '@vitejs/plugin-react': '^4.0.3',
        'vite': '^4.4.5'
      }
    };
    
    files.push({
      path: path.join(projectName, 'frontend', 'package.json'),
      content: JSON.stringify(reactPackageJson, null, 2)
    });
    
    // Create basic React app structure
    files.push({
      path: path.join(projectName, 'frontend', 'index.html'),
      content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${projectName}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>`
    });
    
    files.push({
      path: path.join(projectName, 'frontend', 'src', 'main.jsx'),
      content: `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)`
    });
    
    files.push({
      path: path.join(projectName, 'frontend', 'src', 'index.css'),
      content: `body {
  margin: 0;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

button {
  background-color: #4CAF50;
  border: none;
  color: white;
  padding: 10px 20px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  margin: 4px 2px;
  cursor: pointer;
  border-radius: 4px;
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

input {
  padding: 8px;
  margin: 8px 0;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

.card {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.error {
  color: red;
  margin: 10px 0;
}

.success {
  color: green;
  margin: 10px 0;
}`
    });
    
    // Create App with Web3 integration
    let appContent;
    
    if (projectType === 'erc20') {
      appContent = `import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import './App.css'

function App() {
  const [provider, setProvider] = useState(null)
  const [signer, setSigner] = useState(null)
  const [contract, setContract] = useState(null)
  const [account, setAccount] = useState('')
  const [balance, setBalance] = useState('0')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [transferTo, setTransferTo] = useState('')
  const [transferAmount, setTransferAmount] = useState('')
  
  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        setLoading(true)
        setError('')
        
        const provider = new ethers.BrowserProvider(window.ethereum)
        setProvider(provider)
        
        const accounts = await provider.send('eth_requestAccounts', [])
        if (accounts.length > 0) {
          setAccount(accounts[0])
          const signer = await provider.getSigner()
          setSigner(signer)
        }
        
        setLoading(false)
      } else {
        setError('MetaMask is not installed')
      }
    } catch (error) {
      console.error('Connection error:', error)
      setError('Error connecting to wallet')
      setLoading(false)
    }
  }
  
  const loadContract = async () => {
    if (!signer) return
    
    try {
      setLoading(true)
      
      // Replace with your contract address and ABI
      const contractAddress = 'YOUR_CONTRACT_ADDRESS'
      const abi = [
        'function name() view returns (string)',
        'function symbol() view returns (string)',
        'function decimals() view returns (uint8)',
        'function totalSupply() view returns (uint256)',
        'function balanceOf(address) view returns (uint256)',
        'function transfer(address to, uint amount) returns (bool)'
      ]
      
      const contract = new ethers.Contract(contractAddress, abi, signer)
      setContract(contract)
      
      if (account) {
        const balance = await contract.balanceOf(account)
        const decimals = await contract.decimals()
        setBalance(ethers.formatUnits(balance, decimals))
      }
      
      setLoading(false)
    } catch (error) {
      console.error('Contract loading error:', error)
      setError('Error loading contract')
      setLoading(false)
    }
  }
  
  const handleTransfer = async (e) => {
    e.preventDefault()
    
    if (!contract || !signer) {
      setError('Please connect wallet and load contract first')
      return
    }
    
    if (!transferTo || !transferAmount) {
      setError('Please enter recipient address and amount')
      return
    }
    
    try {
      setLoading(true)
      setError('')
      
      const decimals = await contract.decimals()
      const amount = ethers.parseUnits(transferAmount, decimals)
      
      const tx = await contract.transfer(transferTo, amount)
      await tx.wait()
      
      // Update balance
      const balance = await contract.balanceOf(account)
      setBalance(ethers.formatUnits(balance, decimals))
      
      setTransferTo('')
      setTransferAmount('')
      setLoading(false)
    } catch (error) {
      console.error('Transfer error:', error)
      setError('Error making transfer')
      setLoading(false)
    }
  }
  
  useEffect(() => {
    if (signer) {
      loadContract()
    }
  }, [signer])
  
  return (
    <div className="container">
      <h1>${erc20Options?.name || 'ERC20 Token'} App</h1>
      
      <div className="card">
        <h2>Wallet Connection</h2>
        {!account ? (
          <button onClick={connectWallet} disabled={loading}>
            {loading ? 'Connecting...' : 'Connect Wallet'}
          </button>
        ) : (
          <div>
            <p>Connected Account: {account.slice(0, 6)}...{account.slice(-4)}</p>
            <p>Token Balance: {balance} ${erc20Options?.symbol || 'TOKEN'}</p>
          </div>
        )}
      </div>
      
      {contract && (
        <div className="card">
          <h2>Transfer Tokens</h2>
          <form onSubmit={handleTransfer}>
            <div>
              <label>Recipient Address:</label>
              <input 
                type="text" 
                value={transferTo} 
                onChange={(e) => setTransferTo(e.target.value)}
                placeholder="0x..."
                style={{ width: '100%' }}
              />
            </div>
            <div>
              <label>Amount:</label>
              <input 
                type="text" 
                value={transferAmount} 
                onChange={(e) => setTransferAmount(e.target.value)}
                placeholder="0.0"
              />
            </div>
            <button type="submit" disabled={loading}>
              {loading ? 'Processing...' : 'Transfer'}
            </button>
          </form>
        </div>
      )}
      
      {error && <p className="error">{error}</p>}
    </div>
  )
}

export default App`;
      
    } else if (projectType === 'erc721') {
      appContent = `import { useState, useEffect } from 'react'
import { ethers } from 'ethers'
import './App.css'

function App() {
  const [provider, setProvider] = useState(null)
  const [signer, setSigner] = useState(null)
  const [contract, setContract] = useState(null)
  const [account, setAccount] = useState('')
  const [nftBalance, setNftBalance] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mintPrice, setMintPrice] = useState('0')
  const [tokenURI, setTokenURI] = useState('')
  
  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        setLoading(true)
        setError('')
        
        const provider = new ethers.BrowserProvider(window.ethereum)
        setProvider(provider)
        
        const accounts = await provider.send('eth_requestAccounts', [])
        if (accounts.length > 0) {
          setAccount(accounts[0])
          const signer = await provider.getSigner()
          setSigner(signer)
        }
        
        setLoading(false)
      } else {
        setError('MetaMask is not installed')
      }
    } catch (error) {
      console.error('Connection error:', error)
      setError('Error connecting to wallet')
      setLoading(false)
    }
  }
  
  const loadContract = async () => {
    if (!signer) return
    
    try {
      setLoading(true)
      
      // Replace with your contract address and ABI
      const contractAddress = 'YOUR_CONTRACT_ADDRESS'
      const abi = [
        'function name() view returns (string)',
        'function symbol() view returns (string)',
        'function balanceOf(address) view returns (uint256)',
        'function tokenURI(uint256) view returns (string)',
        'function mintNFT(address, string) payable returns (uint256)',
        'function mintPrice() view returns (uint256)',
        'function currentTokenId() view returns (uint256)'
      ]
      
      const contract = new ethers.Contract(contractAddress, abi, signer)
      setContract(contract)
      
      if (account) {
        const balance = await contract.balanceOf(account)
        setNftBalance(Number(balance))
        
        const price = await contract.mintPrice()
        setMintPrice(ethers.formatEther(price))
      }
      
      setLoading(false)
    } catch (error) {
      console.error('Contract loading error:', error)
      setError('Error loading contract')
      setLoading(false)
    }
  }
  
  const handleMint = async () => {
    if (!contract || !signer) {
      setError('Please connect wallet and load contract first')
      return
    }
    
    if (!tokenURI) {
      setError('Please enter a token URI')
      return
    }
    
    try {
      setLoading(true)
      setError('')
      
      const price = await contract.mintPrice()
      
      const tx = await contract.mintNFT(account, tokenURI, {
        value: price
      })
      await tx.wait()
      
      // Update balance
      const balance = await contract.balanceOf(account)
      setNftBalance(Number(balance))
      
      setTokenURI('')
      setLoading(false)
    } catch (error) {
      console.error('Minting error:', error)
      setError('Error minting NFT')
      setLoading(false)
    }
  }
  
  useEffect(() => {
    if (signer) {
      loadContract()
    }
  }, [signer])
  
  return (
    <div className="container">
      <h1>${erc721Options?.name || 'NFT Collection'}</h1>
      
      <div className="card">
        <h2>Wallet Connection</h2>
        {!account ? (
          <button onClick={connectWallet} disabled={loading}>
            {loading ? 'Connecting...' : 'Connect Wallet'}
          </button>
        ) : (
          <div>
            <p>Connected Account: {account.slice(0, 6)}...{account.slice(-4)}</p>
            <p>NFT Balance: {nftBalance}</p>
            <p>Mint Price: {mintPrice} ETH</p>
          </div>
        )}
      </div>
      
      {contract && (
        <div className="card">
          <h2>Mint NFT</h2>
          <div>
            <label>Token URI:</label>
            <input 
              type="text" 
              value={tokenURI} 
              onChange={(e) => setTokenURI(e.target.value)}
              placeholder="https://example.com/metadata/1"
              style={{ width: '100%' }}
            />
          </div>
          <button onClick={handleMint} disabled={loading}>
            {loading ? 'Processing...' : 'Mint NFT'}
          </button>
          <p>Note: Minting costs {mintPrice} ETH</p>
        </div>
      )}
      
      {error && <p className="error">{error}</p>}
    </div>
  )
}

export default App`;
      
    } else {
      // Default minimal app
      appContent = `import { useState } from 'react'
import { ethers } from 'ethers'
import './App.css'

function App() {
  const [provider, setProvider] = useState(null)
  const [signer, setSigner] = useState(null)
  const [account, setAccount] = useState('')
  const [balance, setBalance] = useState('0')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const connectWallet = async () => {
    try {
      if (window.ethereum) {
        setLoading(true)
        setError('')
        
        const provider = new ethers.BrowserProvider(window.ethereum)
        setProvider(provider)
        
        const accounts = await provider.send('eth_requestAccounts', [])
        if (accounts.length > 0) {
          setAccount(accounts[0])
          const signer = await provider.getSigner()
          setSigner(signer)
          
          const balance = await provider.getBalance(accounts[0])
          setBalance(ethers.formatEther(balance))
        }
        
        setLoading(false)
      } else {
        setError('MetaMask is not installed')
      }
    } catch (error) {
      console.error('Connection error:', error)
      setError('Error connecting to wallet')
      setLoading(false)
    }
  }
  
  return (
    <div className="container">
      <h1>${projectName}</h1>
      
      <div className="card">
        <h2>Wallet Connection</h2>
        {!account ? (
          <button onClick={connectWallet} disabled={loading}>
            {loading ? 'Connecting...' : 'Connect Wallet'}
          </button>
        ) : (
          <div>
            <p>Connected Account: {account.slice(0, 6)}...{account.slice(-4)}</p>
            <p>ETH Balance: {balance}</p>
          </div>
        )}
      </div>
      
      {error && <p className="error">{error}</p>}
    </div>
  )
}

export default App`;
    }
    
    files.push({
      path: path.join(projectName, 'frontend', 'src', 'App.jsx'),
      content: appContent
    });
    
    files.push({
      path: path.join(projectName, 'frontend', 'src', 'App.css'),
      content: `.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  color: #333;
  text-align: center;
}

.card {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

form div {
  margin-bottom: 10px;
}

label {
  display: block;
  margin-bottom: 5px;
}

button {
  margin-top: 10px;
}`
    });
    
    // Add vite.config.js
    files.push({
      path: path.join(projectName, 'frontend', 'vite.config.js'),
      content: `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})`
    });
  }
  
  // Add a README.md
  files.push({
    path: path.join(projectName, 'README.md'),
    content: `# ${projectName}

${getProjectDescription(projectType, options)}

## Project Structure

${useHardhat ? `- \`/contracts\`: Smart contract code
- \`/scripts\`: Deployment scripts
- \`/test\`: Contract tests` : ''}
${useReact ? `- \`/frontend\`: React-based frontend application` : ''}

## Getting Started

### Smart Contract Development

${useHardhat ? `1. Install dependencies:
   \`\`\`
   npm install
   \`\`\`

2. Compile the contracts:
   \`\`\`
   npm run compile
   \`\`\`

3. Run tests:
   \`\`\`
   npm test
   \`\`\`

4. Start a local blockchain:
   \`\`\`
   npm run node
   \`\`\`

5. Deploy to the local blockchain (in a new terminal):
   \`\`\`
   npm run deploy
   \`\`\`
` : ''}

### Frontend Development

${useReact ? `1. Navigate to the frontend directory:
   \`\`\`
   cd frontend
   \`\`\`

2. Install dependencies:
   \`\`\`
   npm install
   \`\`\`

3. Start the development server:
   \`\`\`
   npm run dev
   \`\`\`

4. Open your browser at \`http://localhost:5173\`
` : ''}

## Contract Information

${getContractInfo(projectType, options)}
`
  });
  
  return files;
}

function getTemplateContent(templateName: string): string {
  try {
    // In a browser environment, we'd need a different approach
    // This is just a placeholder for how it would work in Node.js
    const templatePath = path.join(__dirname, 'templates', templateName);
    return fs.readFileSync(templatePath, 'utf8');
  } catch (error) {
    console.error(`Error reading template ${templateName}:`, error);
    return ''; // Return empty string on error
  }
}

function getProjectDescription(projectType: string, options: Web3ProjectOptions): string {
  switch (projectType) {
    case 'erc20':
      return `An ERC20 token project with the token name "${options.erc20Options?.name || 'Token'}" and symbol "${options.erc20Options?.symbol || 'TKN'}".`;
    case 'erc721':
      return `An NFT (ERC721) project with the collection name "${options.erc721Options?.name || 'NFT Collection'}" and symbol "${options.erc721Options?.symbol || 'NFT'}".`;
    case 'dapp':
      return 'A decentralized application (DApp) with smart contracts and a frontend.';
    case 'minimal':
      return 'A minimal Web3 project to get started with blockchain development.';
    default:
      return 'A Web3 development project.';
  }
}

function getContractInfo(projectType: string, options: Web3ProjectOptions): string {
  switch (projectType) {
    case 'erc20':
      return `- Token Name: ${options.erc20Options?.name || 'Token'}
- Token Symbol: ${options.erc20Options?.symbol || 'TKN'}
- Initial Supply: ${options.erc20Options?.initialSupply || '1000000'}
- Maximum Supply: ${options.erc20Options?.maxSupply || '10000000'}`;
    case 'erc721':
      return `- Collection Name: ${options.erc721Options?.name || 'NFT Collection'}
- Collection Symbol: ${options.erc721Options?.symbol || 'NFT'}
- Maximum Supply: ${options.erc721Options?.maxSupply || '10000'}
- Mint Price: ${Number(options.erc721Options?.mintPrice || '10000000000000000') / 1e18} ETH`;
    default:
      return '';
  }
} 
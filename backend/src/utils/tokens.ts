import { ethers } from 'ethers';
import { provider } from '../config';
import { logger } from './logger';

/**
 * Token utility functions for DCA and rebalancing operations
 */

/**
 * Common token addresses (mainnet)
 */
export const TOKEN_ADDRESSES = {
  ETH: '0x0000000000000000000000000000000000000000', // Native ETH (zero address)
  WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  USDC: '0xA0b86a33E6441E67f8e1f4a6D2A4cb7C3d4b2b8D',
  USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  WBTC: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599'
} as const;

/**
 * Token information structure
 */
export interface TokenInfo {
  address: string;
  symbol: string;
  decimals: number;
  name: string;
}

/**
 * ERC-20 Token ABI (minimal interface for balance and transfer operations)
 */
const ERC20_ABI = [
  "function name() view returns (string)",
  "function symbol() view returns (string)",
  "function decimals() view returns (uint8)",
  "function totalSupply() view returns (uint256)",
  "function balanceOf(address) view returns (uint256)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function approve(address spender, uint256 amount) returns (bool)"
];

/**
 * Validate Ethereum address format
 * 
 * @param address - Address to validate
 * @returns True if valid Ethereum address
 */
export function isValidAddress(address: string): boolean {
  return ethers.isAddress(address);
}

/**
 * Validate token address and ensure it's not zero address (unless it's ETH)
 * 
 * @param address - Token address to validate
 * @param allowZeroAddress - Whether to allow zero address (for ETH)
 * @returns True if valid token address
 */
export function isValidTokenAddress(address: string, allowZeroAddress = false): boolean {
  if (!isValidAddress(address)) {
    return false;
  }
  
  if (address === TOKEN_ADDRESSES.ETH) {
    return allowZeroAddress;
  }
  
  return true;
}

/**
 * Get token information from contract
 * 
 * @param tokenAddress - Token contract address
 * @returns Token information
 */
export async function getTokenInfo(tokenAddress: string): Promise<TokenInfo> {
  try {
    // Handle native ETH
    if (tokenAddress === TOKEN_ADDRESSES.ETH) {
      return {
        address: TOKEN_ADDRESSES.ETH,
        symbol: 'ETH',
        decimals: 18,
        name: 'Ethereum'
      };
    }

    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    
    const [name, symbol, decimals] = await Promise.all([
      contract.name(),
      contract.symbol(),
      contract.decimals()
    ]);

    return {
      address: tokenAddress,
      symbol,
      decimals: Number(decimals),
      name
    };
  } catch (error) {
    logger.error('Failed to get token info', { error, tokenAddress });
    throw new Error(`Failed to get token information for ${tokenAddress}`);
  }
}

/**
 * Get token balance for an address
 * 
 * @param tokenAddress - Token contract address
 * @param userAddress - User address
 * @returns Token balance in wei
 */
export async function getTokenBalance(tokenAddress: string, userAddress: string): Promise<bigint> {
  try {
    // Handle native ETH
    if (tokenAddress === TOKEN_ADDRESSES.ETH) {
      return await provider.getBalance(userAddress);
    }

    const contract = new ethers.Contract(tokenAddress, ERC20_ABI, provider);
    return await contract.balanceOf(userAddress);
  } catch (error) {
    logger.error('Failed to get token balance', { error, tokenAddress, userAddress });
    throw new Error(`Failed to get balance for token ${tokenAddress}`);
  }
}

/**
 * Format token amount from wei to human readable format
 * 
 * @param amount - Amount in wei
 * @param decimals - Token decimals
 * @param precision - Number of decimal places to show
 * @returns Formatted amount string
 */
export function formatTokenAmount(amount: bigint, decimals: number, precision = 6): string {
  const formatted = ethers.formatUnits(amount, decimals);
  const num = parseFloat(formatted);
  
  if (num === 0) return '0';
  
  return num.toFixed(precision).replace(/\.?0+$/, '');
}

/**
 * Parse token amount from human readable format to wei
 * 
 * @param amount - Human readable amount
 * @param decimals - Token decimals
 * @returns Amount in wei
 */
export function parseTokenAmount(amount: string, decimals: number): bigint {
  return ethers.parseUnits(amount, decimals);
}

/**
 * Calculate USD value of token amount (placeholder - would integrate with price oracle)
 * 
 * @param tokenAddress - Token address
 * @param amount - Token amount in wei
 * @param decimals - Token decimals
 * @returns USD value (placeholder)
 */
export async function calculateUSDValue(
  tokenAddress: string, 
  amount: bigint, 
  decimals: number
): Promise<number> {
  // Placeholder prices - in production would use Chainlink or other price oracle
  const mockPrices: Record<string, number> = {
    [TOKEN_ADDRESSES.ETH]: 2500,
    [TOKEN_ADDRESSES.WETH]: 2500,
    [TOKEN_ADDRESSES.USDC]: 1,
    [TOKEN_ADDRESSES.USDT]: 1,
    [TOKEN_ADDRESSES.DAI]: 1,
    [TOKEN_ADDRESSES.WBTC]: 45000
  };

  const price = mockPrices[tokenAddress] || 1;
  const tokenAmount = parseFloat(ethers.formatUnits(amount, decimals));
  
  return tokenAmount * price;
}

/**
 * Validate minimum amount for slippage protection
 * 
 * @param expectedAmount - Expected output amount
 * @param minAmount - Minimum acceptable amount
 * @param maxSlippage - Maximum allowed slippage percentage (e.g., 5 for 5%)
 * @returns True if minAmount provides adequate slippage protection
 */
export function validateSlippage(expectedAmount: bigint, minAmount: bigint, maxSlippage: number): boolean {
  const slippageAmount = (expectedAmount * BigInt(maxSlippage)) / 100n;
  const minExpected = expectedAmount - slippageAmount;
  
  return minAmount >= minExpected;
}

/**
 * Calculate minimum output amount with slippage tolerance
 * 
 * @param expectedAmount - Expected output amount
 * @param slippagePercent - Slippage tolerance percentage (e.g., 5 for 5%)
 * @returns Minimum output amount
 */
export function calculateMinOutputWithSlippage(expectedAmount: bigint, slippagePercent: number): bigint {
  const slippageAmount = (expectedAmount * BigInt(slippagePercent * 100)) / 10000n;
  return expectedAmount - slippageAmount;
}

/**
 * Check if two token addresses are the same (case insensitive)
 * 
 * @param tokenA - First token address
 * @param tokenB - Second token address
 * @returns True if addresses are the same
 */
export function isSameToken(tokenA: string, tokenB: string): boolean {
  return tokenA.toLowerCase() === tokenB.toLowerCase();
}

/**
 * Get multiple token balances efficiently
 * 
 * @param tokenAddresses - Array of token addresses
 * @param userAddress - User address
 * @returns Object mapping token addresses to balances
 */
export async function getMultipleTokenBalances(
  tokenAddresses: string[], 
  userAddress: string
): Promise<Record<string, bigint>> {
  const balances: Record<string, bigint> = {};
  
  const balancePromises = tokenAddresses.map(async (tokenAddress) => {
    try {
      const balance = await getTokenBalance(tokenAddress, userAddress);
      return { tokenAddress, balance };
    } catch (error) {
      logger.warn(`Failed to get balance for token ${tokenAddress}:`, error);
      return { tokenAddress, balance: 0n };
    }
  });

  const results = await Promise.all(balancePromises);
  
  for (const { tokenAddress, balance } of results) {
    balances[tokenAddress] = balance;
  }

  return balances;
}

/**
 * Check if amount is within dust threshold (too small to be meaningful)
 * 
 * @param amount - Amount to check
 * @param decimals - Token decimals
 * @param dustThreshold - Dust threshold (default 0.000001)
 * @returns True if amount is above dust threshold
 */
export function isAboveDustThreshold(amount: bigint, decimals: number, dustThreshold = 0.000001): boolean {
  const formattedAmount = parseFloat(ethers.formatUnits(amount, decimals));
  return formattedAmount > dustThreshold;
}

/**
 * Validate token pair for trading
 * 
 * @param tokenFrom - Source token address
 * @param tokenTo - Destination token address
 * @returns True if valid trading pair
 */
export function isValidTradingPair(tokenFrom: string, tokenTo: string): boolean {
  // Can't trade same token
  if (isSameToken(tokenFrom, tokenTo)) {
    return false;
  }

  // Both must be valid addresses
  if (!isValidTokenAddress(tokenFrom, true) || !isValidTokenAddress(tokenTo, true)) {
    return false;
  }

  return true;
}
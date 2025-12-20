// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title AutoBalancerAgent
 * @dev A minimal execution agent for MetaMask Advanced Permissions (ERC-7715)
 * 
 * This contract acts as a permissioned execution agent that receives pre-validated
 * calls from MetaMask Smart Accounts. It does NOT manage user funds directly or
 * perform permission checks - those are handled by the Smart Account layer.
 * 
 * The contract's primary purpose is to:
 * 1. Receive execution calls that are already permission-validated
 * 2. Emit clear events for off-chain indexing (Envio) and UI updates
 * 3. Support agent-to-agent (A2A) delegation for complex workflows
 * 
 * For hackathon demonstration, this contract simulates DCA and rebalancing
 * operations through events rather than actual DEX interactions.
 */
contract AutoBalancerAgent {
    
    // ============ STRUCTS ============
    
    /**
     * @dev Represents target asset allocation for rebalancing
     */
    struct AssetWeight {
        address token;          // Token contract address
        uint256 targetPercent;  // Target percentage (basis points, 10000 = 100%)
        uint256 currentAmount;  // Current amount held
        uint256 targetAmount;   // Target amount after rebalancing
    }
    
    /**
     * @dev Stores delegation information for A2A use cases
     */
    struct DelegationInfo {
        bytes32 parentPermissionId;  // Original permission from user
        address delegatee;           // Agent receiving delegation
        uint256 allowance;          // Delegated spending limit
        uint256 spent;              // Amount already spent by delegatee
        bool isActive;              // Whether delegation is active
        uint256 createdAt;          // Timestamp when delegation was created
    }
    
    // ============ STATE VARIABLES ============
    
    /// @dev Mapping to track delegation permissions
    mapping(bytes32 => DelegationInfo) public delegations;
    
    /// @dev Counter for generating unique delegation IDs
    uint256 private _delegationCounter;
    
    // ============ EVENTS ============
    
    /**
     * @dev Emitted when a DCA (Dollar Cost Averaging) execution is simulated
     * @param user The user for whom DCA is executed
     * @param tokenFrom Source token address
     * @param tokenTo Destination token address  
     * @param amount Amount of source token to swap
     * @param executedAt Timestamp of execution
     * @param executionId Unique identifier for this execution
     */
    event DCAExecuted(
        address indexed user,
        address indexed tokenFrom,
        address indexed tokenTo,
        uint256 amount,
        uint256 executedAt,
        bytes32 executionId
    );
    
    /**
     * @dev Emitted when a portfolio rebalancing operation is simulated
     * @param user The user whose portfolio is being rebalanced
     * @param totalAssets Number of assets in the rebalancing operation
     * @param totalValue Total portfolio value being rebalanced
     * @param executedAt Timestamp of execution
     * @param executionId Unique identifier for this execution
     */
    event RebalanceExecuted(
        address indexed user,
        uint256 totalAssets,
        uint256 totalValue,
        uint256 executedAt,
        bytes32 executionId
    );
    
    /**
     * @dev Emitted for each asset adjustment during rebalancing
     * @param user The user whose portfolio is being rebalanced
     * @param token Token being adjusted
     * @param fromAmount Amount before rebalancing
     * @param toAmount Amount after rebalancing
     * @param action Whether this is a "buy" or "sell" operation
     * @param executionId Links to the main RebalanceExecuted event
     */
    event AssetRebalanced(
        address indexed user,
        address indexed token,
        uint256 fromAmount,
        uint256 toAmount,
        string action,
        bytes32 indexed executionId
    );
    
    /**
     * @dev Emitted when permissions are delegated to another agent
     * @param parentPermissionId Original permission ID from MetaMask
     * @param delegator Address that created the delegation (this contract)
     * @param delegatee Address receiving the delegation
     * @param allowance Amount delegated
     * @param delegationId Unique delegation identifier
     * @param createdAt Timestamp of delegation
     */
    event PermissionDelegated(
        bytes32 indexed parentPermissionId,
        address indexed delegator,
        address indexed delegatee,
        uint256 allowance,
        bytes32 delegationId,
        uint256 createdAt
    );
    
    /**
     * @dev Emitted when a delegation is used by the delegatee
     * @param delegationId The delegation being used
     * @param delegatee Address using the delegation
     * @param amount Amount spent from delegation
     * @param remainingAllowance Remaining allowance after this use
     */
    event DelegationUsed(
        bytes32 indexed delegationId,
        address indexed delegatee,
        uint256 amount,
        uint256 remainingAllowance
    );
    
    // ============ MAIN EXECUTION FUNCTIONS ============
    
    /**
     * @dev Simulates Dollar Cost Averaging (DCA) execution
     * 
     * This function assumes that:
     * 1. The caller has already been validated by MetaMask Smart Account
     * 2. Permission checks (spending limits, time windows) have been enforced
     * 3. The user has sufficient balance and allowances
     * 
     * For hackathon purposes, this emits events instead of performing real swaps.
     * 
     * @param user The user for whom DCA is being executed
     * @param tokenFrom Source token to swap from
     * @param tokenTo Destination token to swap to
     * @param amount Amount of tokenFrom to swap
     */
    function executeDCA(
        address user,
        address tokenFrom,
        address tokenTo,
        uint256 amount
    ) external {
        require(user != address(0), "Invalid user address");
        require(tokenFrom != address(0), "Invalid tokenFrom address");
        require(tokenTo != address(0), "Invalid tokenTo address");
        require(amount > 0, "Amount must be greater than 0");
        require(tokenFrom != tokenTo, "Cannot swap token to itself");
        
        // Generate unique execution ID
        bytes32 executionId = keccak256(
            abi.encodePacked(
                block.timestamp,
                user,
                tokenFrom,
                tokenTo,
                amount,
                _delegationCounter++
            )
        );
        
        // Emit DCA execution event for indexing
        emit DCAExecuted(
            user,
            tokenFrom,
            tokenTo,
            amount,
            block.timestamp,
            executionId
        );
    }
    
    /**
     * @dev Simulates portfolio rebalancing execution
     * 
     * This function assumes that:
     * 1. Permission validation has been completed by the Smart Account layer
     * 2. The rebalancing targets have been calculated off-chain
     * 3. All necessary token approvals are in place
     * 
     * For hackathon demonstration, this emits detailed events for each asset adjustment.
     * 
     * @param user The user whose portfolio is being rebalanced
     * @param targets Array of target asset allocations
     */
    function executeRebalance(
        address user,
        AssetWeight[] calldata targets
    ) external {
        require(user != address(0), "Invalid user address");
        require(targets.length > 0, "No rebalancing targets provided");
        require(targets.length <= 10, "Too many assets (max 10)");
        
        // Calculate total portfolio value
        uint256 totalValue = 0;
        for (uint256 i = 0; i < targets.length; i++) {
            require(targets[i].token != address(0), "Invalid token address");
            require(targets[i].targetPercent <= 10000, "Invalid target percentage");
            totalValue += targets[i].currentAmount;
        }
        
        require(totalValue > 0, "Portfolio has no value");
        
        // Generate unique execution ID
        bytes32 executionId = keccak256(
            abi.encodePacked(
                block.timestamp,
                user,
                totalValue,
                targets.length,
                _delegationCounter++
            )
        );
        
        // Emit main rebalancing event
        emit RebalanceExecuted(
            user,
            targets.length,
            totalValue,
            block.timestamp,
            executionId
        );
        
        // Emit individual asset adjustments
        for (uint256 i = 0; i < targets.length; i++) {
            AssetWeight memory target = targets[i];
            
            // Determine if this is a buy or sell operation
            string memory action = target.targetAmount > target.currentAmount ? "buy" : "sell";
            
            // Skip if no change needed
            if (target.targetAmount != target.currentAmount) {
                emit AssetRebalanced(
                    user,
                    target.token,
                    target.currentAmount,
                    target.targetAmount,
                    action,
                    executionId
                );
            }
        }
    }
    
    // ============ DELEGATION FUNCTIONS ============
    
    /**
     * @dev Creates a delegation from a parent permission to another agent
     * 
     * This enables agent-to-agent (A2A) delegation where this contract can
     * delegate part of its permission to another contract or agent.
     * 
     * @param parentPermissionId The original permission ID from MetaMask
     * @param delegatee The address receiving the delegation
     * @param allowance The amount being delegated
     * @return delegationId Unique identifier for this delegation
     */
    function delegatePermission(
        bytes32 parentPermissionId,
        address delegatee,
        uint256 allowance
    ) external returns (bytes32 delegationId) {
        require(parentPermissionId != bytes32(0), "Invalid parent permission ID");
        require(delegatee != address(0), "Invalid delegatee address");
        require(delegatee != address(this), "Cannot delegate to self");
        require(allowance > 0, "Allowance must be greater than 0");
        
        // Generate unique delegation ID
        delegationId = keccak256(
            abi.encodePacked(
                parentPermissionId,
                delegatee,
                allowance,
                block.timestamp,
                _delegationCounter++
            )
        );
        
        // Store delegation info
        delegations[delegationId] = DelegationInfo({
            parentPermissionId: parentPermissionId,
            delegatee: delegatee,
            allowance: allowance,
            spent: 0,
            isActive: true,
            createdAt: block.timestamp
        });
        
        // Emit delegation event
        emit PermissionDelegated(
            parentPermissionId,
            address(this),
            delegatee,
            allowance,
            delegationId,
            block.timestamp
        );
        
        return delegationId;
    }
    
    /**
     * @dev Allows a delegatee to use their delegation
     * 
     * This function would be called by other agents when they want to use
     * a delegation that was granted to them.
     * 
     * @param delegationId The delegation to use
     * @param amount Amount to spend from the delegation
     */
    function useDelegation(
        bytes32 delegationId,
        uint256 amount
    ) external {
        DelegationInfo storage delegation = delegations[delegationId];
        
        require(delegation.isActive, "Delegation is not active");
        require(delegation.delegatee == msg.sender, "Not authorized to use this delegation");
        require(amount > 0, "Amount must be greater than 0");
        require(delegation.spent + amount <= delegation.allowance, "Insufficient delegation allowance");
        
        // Update spent amount
        delegation.spent += amount;
        
        // Calculate remaining allowance
        uint256 remainingAllowance = delegation.allowance - delegation.spent;
        
        // Emit usage event
        emit DelegationUsed(
            delegationId,
            msg.sender,
            amount,
            remainingAllowance
        );
    }
    
    // ============ VIEW FUNCTIONS ============
    
    /**
     * @dev Gets delegation information
     * @param delegationId The delegation ID to query
     * @return The delegation information struct
     */
    function getDelegationInfo(bytes32 delegationId) external view returns (DelegationInfo memory) {
        return delegations[delegationId];
    }
    
    /**
     * @dev Checks if a delegation has sufficient allowance for an amount
     * @param delegationId The delegation to check
     * @param amount The amount to check against
     * @return Whether the delegation has sufficient allowance
     */
    function checkDelegationAllowance(
        bytes32 delegationId,
        uint256 amount
    ) external view returns (bool) {
        DelegationInfo storage delegation = delegations[delegationId];
        return delegation.isActive && (delegation.spent + amount <= delegation.allowance);
    }
    
    /**
     * @dev Gets the remaining allowance for a delegation
     * @param delegationId The delegation to check
     * @return The remaining allowance amount
     */
    function getDelegationRemainingAllowance(bytes32 delegationId) external view returns (uint256) {
        DelegationInfo storage delegation = delegations[delegationId];
        if (!delegation.isActive || delegation.spent >= delegation.allowance) {
            return 0;
        }
        return delegation.allowance - delegation.spent;
    }
    
    // ============ UTILITY FUNCTIONS ============
    
    /**
     * @dev Validates that asset weights sum to 100% (10000 basis points)
     * @param targets Array of asset weights to validate
     * @return Whether the weights are valid
     */
    function validateAssetWeights(AssetWeight[] calldata targets) external pure returns (bool) {
        uint256 totalPercent = 0;
        for (uint256 i = 0; i < targets.length; i++) {
            totalPercent += targets[i].targetPercent;
        }
        return totalPercent == 10000; // 100% in basis points
    }
    
    /**
     * @dev Returns contract metadata for UI integration
     * @return name Contract name
     * @return version Contract version
     * @return description Brief description of the contract's purpose
     */
    function getContractInfo() external pure returns (
        string memory name,
        string memory version,
        string memory description
    ) {
        return (
            "AutoBalancerAgent",
            "1.0.0",
            "Permissioned execution agent for MetaMask Advanced Permissions (ERC-7715)"
        );
    }
}
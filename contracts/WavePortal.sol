// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract WavePortal {
    uint256 totalWaves;
    uint256 private seed;

    event NewWave(address indexed from, uint256 timestamp, string message);

    struct Waves {
        address account;
        string message;
        uint256 timestamp;
    }

    constructor() payable {
        console.log("We have been constructed!");

        // configurar el numero aleatorio
        seed = (block.timestamp + block.difficulty) % 100;
    }

    Waves[] mywaves;

    /*
     * This is an address => uint mapping, meaning I can associate an address with a number!
     * In this case, I'll be storing the address with the last time the user waved at us.
     */
    mapping(address => uint256) public lastWavedAt;

    function wave(string memory message) public {

        require(
            lastWavedAt[msg.sender] + 30 seconds < block.timestamp,
            "Wait 30 seconds for send a new wave"
        );

        /*
         * Update the current timestamp we have for the user
         */
        lastWavedAt[msg.sender] = block.timestamp;

        totalWaves += 1;
        mywaves.push(Waves(msg.sender, message, block.timestamp));

        emit NewWave(msg.sender, block.timestamp, message);
        // creamos un nuevo seed para los nuevos usuarios
        seed = (block.difficulty + block.timestamp + seed) % 100;
        console.log("random", seed);
        if (seed <= 50) {
            console.log("won");
            uint256 prizeAmount = 0.0001 ether;
            require(
                prizeAmount <= address(this).balance,
                "Trying to withdraw more money than the contract has."
            );
            (bool success, ) = (msg.sender).call{value: prizeAmount}("");
            require(success, "Failed to withdraw money from contract.");
        }
    }

    function getAllWaves() public view returns (Waves[] memory) {
        return mywaves;
    }

    function getTotalWaves() public view returns (uint256) {
        return totalWaves;
    }
}

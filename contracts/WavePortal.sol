// SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.0;

import "hardhat/console.sol";

contract WavePortal {
    uint256 totalWaves;

    constructor() {
        console.log("Yo yo, I am a contract and I am smart");
    }

    function wave() public {
        totalWaves += 1;
        console.log("guardado", msg.sender);
    }

    function getTotalWaves() public view returns (uint256){
        console.log("totalWaves", totalWaves);
        return totalWaves;
    }
}

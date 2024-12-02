// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MedicalHistoryContract {
    struct MedicalRecord {
        string disease;
        string diagnosis;
        string status;
    }

    mapping(address => MedicalRecord[]) private medicalHistory;

    event MedicalRecordAdded(address indexed patient, string disease, string diagnosis, string status);

    function addMedicalRecord(string memory _disease, string memory _diagnosis, string memory _status) public {
        MedicalRecord memory newRecord = MedicalRecord(_disease, _diagnosis, _status);
        medicalHistory[msg.sender].push(newRecord);
        emit MedicalRecordAdded(msg.sender, _disease, _diagnosis, _status);
    }

    function getPatientMedicalHistory() public view returns (MedicalRecord[] memory) {
        return medicalHistory[msg.sender];
    }
}

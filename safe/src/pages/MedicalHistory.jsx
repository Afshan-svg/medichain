import React, { useState, Fragment, useEffect } from "react";
import { nanoid } from "nanoid";
import Web3 from "web3";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";
import contract from "../contracts/contract.json";
import { useCookies } from "react-cookie";
import { create } from 'ipfs-http-client'

const MedicalHistory = () => {
  const web3 = new Web3(window.ethereum);
  const mycontract = new web3.eth.Contract(
    contract["abi"],
    contract["address"]
  );
  const [cookies, setCookie] = useCookies();
  const [medical, setMedical] = useState([]);

  useEffect(() => {
    const med = [];
    async function getMed() {
      await mycontract.methods
        .getPatient()
        .call()
        .then(async (res) => {
          for (let i = res.length - 1; i >= 0; i--) {
            if (res[i] === cookies['hash']) {
              const data = await (await fetch(`http://localhost:8080/ipfs/${res[i]}`)).json();
              med.push(data.medical);
              break;
            }
          }
        });
        // console.log(ins);
      setMedical(med);
    }
    getMed();
    return;
  }, [medical.length]);


  const [addFormData, setAddFormData] = useState({
    Date_of_visit: "",
    symptoms: "",
    diagnosis: "",
    recovered: "",
  });

  const handleAddFormChange = (event) => {
    const newFormData = { ...addFormData };
    newFormData[event.target.name] = event.target.value;
    setAddFormData(newFormData);
  };
  // async function submit() {
  //   try {
  //     // Code for getting accounts and current address...
  //     var accounts = await window.ethereum.request({
  //       method: "eth_requestAccounts",
  //     });
  //     var currentaddress = accounts[0];
  //     mycontract.methods.getPatient().call().then(async (res) => {
  //       for (let i = res.length - 1; i >= 0; i--) {
  //         if (res[i] === cookies['hash']) {
  //           const data = await (await fetch(`http://localhost:8080/ipfs/${res[i]}`)).json();
  //           const med = data.medical;
  //           med.push(addFormData); // Error occurs here
  
  //           // Code for updating data and sending it back to the contract...
  //         }
  //       }
  //     });
  //   } catch (error) {
  //     console.error("Error submitting medical data:", error);
  //   }
  // }
  

  async function submit() {
    var accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    var currentaddress = accounts[0];

    mycontract.methods
      .getPatient()
      .call()
      .then(async (res) => {
        for (let i = res.length - 1; i >= 0; i--) {
          if (res[i] === cookies['hash']) {
            const data = await (await fetch(`http://localhost:8080/ipfs/${res[i]}`)).json();
            let med = data.medical || []; // Initialize as empty array if undefined
          med.push(addFormData); 

            data.medical = med;
            let client = create();
            client = create(new URL('http://127.0.0.1:5001'));
            const { cid } = await client.add(JSON.stringify(data));
            const hash = cid['_baseCache'].get('z');

            await mycontract.methods.addPatient(hash).send({ from: currentaddress }).then(() => {
              setCookie('hash', hash);
              alert("Medical Added");
              window.location.reload();
            }).catch((err) => {
              console.log(err);
            })
          }
        }
      });
  }


  async function del(policy) {
    var accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    var currentaddress = accounts[0];

    const web3 = new Web3(window.ethereum);
    const mycontract = new web3.eth.Contract(
      contract["abi"],
      contract["address"]
    );

    mycontract.methods.getPatient().call().then(async (res) => {
      for (let i = res.length - 1; i >= 0; i--) {
        if (res[i] === cookies['hash']) {
          const data = await (await fetch(`http://localhost:8080/ipfs/${res[i]}`)).json();
          const alls = data.medical;
          const newList = [];
          for (let i = 1; i < alls.length; i++) {
            if (alls[i].policyNo === policy) {
              continue;
            }
            else {
              newList.push(alls[[i]]);
            }
          }
          data.medical = newList;

          let client = create();
          client = create(new URL('http://127.0.0.1:5001'));
          const { cid } = await client.add(JSON.stringify(data));
          const hash = cid['_baseCache'].get('z');

          await mycontract.methods.addPatient(hash).send({ from: currentaddress }).then(() => {
            setCookie('hash', hash);
            alert("Deleted");
            window.location.reload();
          }).catch((err) => {
            console.log(err);
          })
        }
      }
    })
  }

  const showMedical = () => {
    if (medical.length > 0 && medical[0]) {
      return medical[0].map(data => (
        <tr key={nanoid()}>
          <td>{data.Date_of_visit}</td>
          <td>{data.symptoms}</td>
          <td>{data.diagnosis}</td>
          <td>{data.recovered}</td>
          <td>
            <input type="button" value="Delete" onClick={() => del(data.policyNo)} />
          </td>
        </tr>
      ));
    } else {
      return null; // or display a message indicating no medical history found
    }
  };
  

  return (
    <div className="flex relative dark:bg-main-dark-bg">
      <div className="w-72 fixed sidebar dark:bg-secondary-dark-bg bg-white ">
        <Sidebar />
      </div>

      <div
        className={
          "dark:bg-main-dark-bg  bg-main-bg min-h-screen ml-72 w-full  "
        }
      >
        <div className="fixed md:static bg-main-bg dark:bg-main-dark-bg navbar w-full ">
          <Navbar />
        </div>
        <div
          style={{ display: "flex", flexDirection: "column", padding: "4rem", justifyContent: "center", alignItems: "flex-end", gap: "4rem" }}
        >
          <form style={{ width: "100%" }}>
            <table style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th className="">Date of Visit</th>
                  <th className="">Symptoms</th>
                  <th className="">Diagnosis</th>
                  <th className="">Have you recovered?</th>
                  <th className="">Actions</th>
                </tr>
              </thead>
              <tbody>
                {showMedical()}
              </tbody>
            </table>
          </form>

          <form style={{
            display: 'flex', flexDirection: 'column', gap: '1rem',
            backgroundColor: 'rgb(3, 201, 215)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '24px',
            borderRadius: '20px',
          }}>
            <h2>Add Medical History</h2>
            <input
              type="text"
              name="Date_of_visit"
              required="required"
              placeholder="Date of Visit"
              onChange={handleAddFormChange}
            />
            <input
              type="text"
              name="symptoms"
              required="required"
              placeholder="Symptoms"
              onChange={handleAddFormChange}
            />
            <input
              type="text"
              name="diagnosis"
              required="required"
              placeholder="Diagnosis"
              onChange={handleAddFormChange}
            />
            <input
              type="text"
              name="recovered"
              required="required"
              placeholder="Have you recovered?"
              onChange={handleAddFormChange}
            />
            <input type="button" value="Save" onClick={submit} />
          </form>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default MedicalHistory;

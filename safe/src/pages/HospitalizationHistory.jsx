import React, { useState, Fragment, useEffect } from "react";
import { nanoid } from "nanoid";
import Web3 from "web3";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";
import contract from "../contracts/contract.json";
import { useCookies } from "react-cookie";
import { create } from 'ipfs-http-client'

const HospitalizationHistory = () => {
  const web3 = new Web3(window.ethereum);
  const mycontract = new web3.eth.Contract(
    contract["abi"],
    contract["address"]
  );
  const [cookies, setCookie] = useCookies();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const his = [];
    async function getHis() {
      await mycontract.methods
        .getPatient()
        .call()
        .then(async (res) => {
          for (let i = res.length - 1; i >= 0; i--) {
            if (res[i] === cookies['hash']) {
              const data = await (await fetch(`http://localhost:8080/ipfs/${res[i]}`)).json();
              his.push(data.history);
              break;
            }
          }
        });
        // console.log(ins);
      setHistory(his);
    }
    getHis();
    return;
  }, [history.length]);


  const [addFormData, setAddFormData] = useState({
    Hospital_name: "",
    year: "",
    reason: "",
    duration: "",
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
            let his = data.history || []; // Initialize as empty array if undefined
          his.push(addFormData); 

            data.history = his;
            let client = create();
            client = create(new URL('http://127.0.0.1:5001'));
            const { cid } = await client.add(JSON.stringify(data));
            const hash = cid['_baseCache'].get('z');

            await mycontract.methods.addPatient(hash).send({ from: currentaddress }).then(() => {
              setCookie('hash', hash);
              alert("Hospitalization History Added");
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
          const alls = data.history;
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
    if (history.length > 0 && history[0]) {
      return history[0].map(data => (
        <tr key={nanoid()}>
          <td>{data.Hospital_name}</td>
          <td>{data.year}</td>
          <td>{data.reason}</td>
          <td>{data.duration}</td>
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
                  <th className="">Name of Hospital</th>
                  <th className="">Year</th>
                  <th className="">Reason</th>
                  <th className="">Duration</th>
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
              name="Hospital_name"
              required="required"
              placeholder="Name of Hospital"
              onChange={handleAddFormChange}
            />
            <input
              type="text"
              name="year"
              required="required"
              placeholder="Year"
              onChange={handleAddFormChange}
            />
            <input
              type="text"
              name="reason"
              required="required"
              placeholder="Reason"
              onChange={handleAddFormChange}
            />
            <input
              type="text"
              name="duration"
              required="required"
              placeholder="Duration"
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

export default HospitalizationHistory;

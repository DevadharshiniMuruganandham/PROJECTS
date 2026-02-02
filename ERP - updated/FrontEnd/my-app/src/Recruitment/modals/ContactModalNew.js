
import React, { useState } from "react";
import "../styles/ContactModalNew.css";
import "../styles/ClientModalNew.css";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { HiMiniBuildingOffice2 } from "react-icons/hi2";
import PopupForm from "./ClientModalNew";

const ContactForm = ({ onClose }) => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [clientName, setClientName] = useState("");
  const [email, setEmail] = useState("");
  const [WorkPhone, setWorkPhone] = useState("");
  const [mobile, setMobile] = useState("");
  const [isClientPopupOpen, setIsClientPopupOpen] = useState(false);

  const openClientPopup = () => setIsClientPopupOpen(true);
  const closeClientPopup = () => setIsClientPopupOpen(false);

  const handleSave = () => {
    console.log({
      firstName,
      lastName,
      clientName,
      email,
      WorkPhone,
      mobile,
    });
    onClose();
  };

  return (
    <div className="contact-modal-overlay">
      <div className="contact-modal-container">
        <div className="contact-modal-header">
          <h2>Quick Create: Contact</h2>
          <button className="contact-modal-close" onClick={onClose}>✖</button>
        </div>

        <label className="contact-modal-label">First Name <span className="required">*</span></label>
        <fieldset className="contact-modal-name-fieldset">
          <select className="contact-modal-select">
            <option value="">- None -</option>
            <option value="Mr.">Mr.</option>
            <option value="Mrs.">Mrs.</option>
            <option value="Ms.">Ms.</option>
          </select>
          <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="contact-modal-input" required />
        </fieldset>

        <label className="contact-modal-label">Last Name *</label>
        <input type="text" className="contact-modal-input" value={lastName} onChange={(e) => setLastName(e.target.value)} required />

        <label className="contact-modal-label">Client Name</label>
        <div className="contact-modal-client-container">
          <input type="text" className="contact-modal-client-input" value={clientName} onChange={(e) => setClientName(e.target.value)} />
          <button type="button" className="contact-modal-client-icon">
            <HiMiniBuildingOffice2 size={18} />
          </button>
        </div>

        <label className="contact-modal-label">Email</label>
        <input type="email" className="contact-modal-input" value={email} onChange={(e) => setEmail(e.target.value)} />

        {/* <label className="contact-modal-label">Work Phone</label>
        <PhoneInput
          country={"us"}
          enableSearch={true}
          placeholder="Enter phone number"
          containerClass="contact-modal-phone-input"
          value={workPhone}
          onChange={setWorkPhone}
        /> */}

        <label className="contact-modal-label">Mobile</label>
        <PhoneInput
          country={"us"}
          enableSearch={true}
          placeholder="Enter phone number"
          containerClass="contact-modal-phone-input"
          value={mobile}
          onChange={setMobile}
        />

        <div className="contact-modal-buttons">
          <button className="contact-modal-btn cancel" onClick={onClose}>Cancel</button>
          <button className="contact-modal-btn associate">Save and Associate</button>
          <button className="contact-modal-btn save" onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
};

const ContactModal = ({ onClose }) => {
  const [showContactForm, setShowContactForm] = useState(false);

  return (
    <>
      {!showContactForm ? (
        <div className="contact-modal-overlay" onClick={onClose}>
          <div className="contact-modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="contact-modal-header">
              <h3>Show:</h3>
              <div className="contact-modal-actions">
                <button className="contact-modal-btn" onClick={() => setShowContactForm(true)}>+ New Contact</button>
                <input type="text" className="contact-modal-input" placeholder="Search" />
                <button className="contact-modal-close" onClick={onClose}>✖</button>
              </div>
            </div>

            <div className="contact-modal-content">
              <table className="contact-modal-table">
                <thead>
                  <tr>
                    <th></th>
                    <th>Contact Name</th>
                    <th>Email</th>
                    <th>Job Title</th>
                    <th>Work Phone</th>
                    <th>Mobile</th>
                    <th>Client Name</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: "John Doe", jobTitle: "Manager", email: "john@example.com", workPhone: "123-456-7890", mobile: "987-654-3210", clientName: "ABC Corp" },
                    { name: "Jane Smith", jobTitle: "Developer", email: "jane@example.com", workPhone: "555-666-7777", mobile: "222-333-4444", clientName: "XYZ Ltd" },
                    { name: "Michael Brown", jobTitle: "Designer", email: "michael@example.com", workPhone: "999-888-7777", mobile: "666-555-4444", clientName: "Design Studio" },
                  ].map((contact, index) => (
                    <tr key={index}>
                      <td><input type="radio" name="contact" className="small-radio" /></td>
                      <td className="contact-modal-link">{contact.name}</td>
                      <td>{contact.email}</td>
                      <td>{contact.jobTitle}</td>
                      <td>{contact.workPhone}</td>
                      <td>{contact.mobile}</td>
                      <td>{contact.clientName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <ContactForm onClose={() => setShowContactForm(false)} />
      )}
    </>
  );
};

export default ContactModal;

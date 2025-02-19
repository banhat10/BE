require("dotenv").config();
// import nodemailer from "nodemailer";
const nodemailer = require("nodemailer");

let sendSimpleEmail = async (dataSend) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, //true for 465, false for other ports
        auth: {
            // TODO: replace `user` and `pass` values from <https://forwardemail.net>
            user: process.env.EMAIL_APP,
            pass: process.env.EMAIL_APP_PASSWORD,
        },
    });

    // send mail with defined transport object
    const info = await transporter.sendMail({
        from: '"HeThongThuCucTCI" <ThuCucTCI@gmail.com>', // sender address
        to: dataSend.receiverEmail, // list of receivers
        subject: "Thông tin đặt lịch khám bệnh ✔", // Subject line
        html: getBodyHTMLEmail(dataSend),
    });
};

let getBodyHTMLEmail = (dataSend) => {
    let result = "";
    if (dataSend.language === "en") {
        result = `
        <h3>Dear ${dataSend.patientName}</h3>
        <p>You receive this email when you make an appointment on ThuCuc General Clinic</p>
        <p>Information to schedule an appointment:</p>
        <div>
            <b>Time: ${dataSend.time}</b>
        </div>
        <div>
           <b>Doctor: ${dataSend.doctorName}</b>
        </div>
        <div>
            <b>Adrress Clinic: ${dataSend.addressClinic}</b>
        </div>
        <div>
            <p>Appointment code: ${dataSend.token}</p>
        </div>
        <p>Please click on the link below to confirm and complete your appointment.</p>
        <div>
            <a href=${dataSend.redirectLink} target="blank">Confirm</a>
        </div>
        <div>
            Thank you very much, have a nice day!
        </div>
        
    `; // html body
    }
    if (dataSend.language === "vi") {
        result = `
        <h3>Xin chào ${dataSend.patientName}</h3>
        <p>Bạn nhận được email này khi đã đặt lịch khám trên Phòng khám Đa Khoa Thu Cúc</p>
        <p>Thông tin đặt lịch:</p>
        <div>
            <b>Thời gian: ${dataSend.time}</b>
        </div>
        <div>
           <b>Bác sĩ: ${dataSend.doctorName}</b>
        </div>
        <div>
            <b>Địa chỉ phòng khám: ${dataSend.addressClinic}</b>
        </div>
        <div>
            <p>Mã lịch hẹn: ${dataSend.token}</p>
        </div>
        <p>Vui lòng click vào đường link dưới để xác nhận và hoàn tất lịch đặt khám.</p>
        <div>
            <a href=${dataSend.redirectLink} target="blank">Xác nhận</a>
        </div>
        <div>
            Xin chân thành cảm ơn, chúc bạn có một ngày vui vẻ!
        </div>
        
    `; // html body
    }

    return result;
};

const sendAttachment = async (dataSend) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false, //true for 465, false for other ports
        auth: {
            // TODO: replace `user` and `pass` values from <https://forwardemail.net>
            user: process.env.EMAIL_APP,
            pass: process.env.EMAIL_APP_PASSWORD,
        },
    });

    // send mail with defined transport object
    const info = await transporter.sendMail({
        from: '"HeThongThuCucTCI" <ThuCucTCI@gmail.com>', // sender address
        to: dataSend.email, // list of receivers
        subject: "Kết quả khám bệnh ✔", // Subject line
        html: getBodyHTMLEmailRemedy(dataSend),
        attachments: [
            //encoded string as an attachment
            {
                filename: `remedy-${dataSend.patientId
                    }-${new Date().getTime()}.png`,
                content: dataSend.image.split("base64,")[1],
                encoding: "base64",
            },
        ],
    });
};

let getBodyHTMLEmailRemedy = (dataSend) => {
    let result = "";
    if (dataSend.language === "en") {
        result = `
        <h3>Dear ${dataSend.patientName}</h3>
        <p>You receive this email when you make an appointment on HeThongThuCucTCI</p>
        <p>Information to schedule an appointment:</p>
        <p>Disease information is sent in the attached file.</p>
        <div>
            Thank you very much, have a nice day!
        </div>
        
    `; // html body
    }
    if (dataSend.language === "vi") {
        result = `
        <h3>Xin chào ${dataSend.patientName}</h3>
        <p>Bạn nhận được email này khi đã đặt lịch khám trên HeThongThuCucTCI</p>
        <p>Thông tin đơn khám bệnh: </p>
        <p>Thông tin đơn thuốc/hóa đơn khám bệnh được gửi trong file đính kèm.</p>
        <div>
            Xin chân thành cảm ơn, chúc bạn có một ngày vui vẻ!
        </div>
        
    `; // html body
    }

    return result;
};

const sendInvoiceEmail = async (req, res) => {
    const { patientName, patientId, services, medicines, totalAmount, recipientEmail } = req.body;
  
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'your-email@gmail.com', // Thay bằng email của bạn
        pass: 'your-app-password',    // App password (không phải mật khẩu tài khoản)
      },
    });
  
    // Nội dung email
    const emailBody = `
      <h1>Hóa đơn chi tiết</h1>
      <p><strong>Tên bệnh nhân:</strong> ${patientName}</p>
      <p><strong>Mã bệnh nhân:</strong> ${patientId}</p>
      <p><strong>Tổng tiền:</strong> ${totalAmount} đ</p>
      <h4>Dịch vụ:</h4>
      <ul>
        ${services.map(service => `<li>${service.serviceDetails.service_name}: ${service.serviceDetails.price} đ</li>`).join('')}
      </ul>
      <h4>Thuốc:</h4>
      <ul>
        ${medicines.map(medicine => `<li>${medicine.medicineDetails.name}: ${medicine.medicineDetails.price} đ x ${medicine.medicine_quantity}</li>`).join('')}
      </ul>
    `;
  
    try {
      await transporter.sendMail({
        from: 'your-email@gmail.com',
        to: recipientEmail, // Email người nhận
        subject: 'Hóa đơn chi tiết',
        html: emailBody,
      });
      res.status(200).send({ success: true, message: 'Email sent successfully' });
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).send({ success: false, message: 'Failed to send email', error });
    }
  };

module.exports = {
    sendSimpleEmail,
    sendAttachment,
    sendInvoiceEmail
};

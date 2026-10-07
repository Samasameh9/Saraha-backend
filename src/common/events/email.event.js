import { EventEmitter } from "node:events";
import { confirmEmailTemplate, sendEmail } from "../utils/index.js";

export const emailEvent = new EventEmitter();

emailEvent.on("sendEmail", async ({ 
       recipent,
        subject,
        data
 }) => {
  try {
    await sendEmail({
      ...recipent,
      subject,
      html:confirmEmailTemplate({subject,data}),
    });
  } catch (error) {
    console.log(error);
    
    console.log("fail to send email");
  }
});

import { useState } from "react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import InputErrorMessage from "../components/ui/InputErrorMessage";
import { LOGIN_FORM } from "../data";
import { SubmitHandler, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { loginSchema } from "../validation";
import toast from "react-hot-toast";
import { AxiosError } from "axios";
import axiosInstance from "../config/axios.config";
import { IErrorResponse } from "../interfaces";

interface IFormInput {
  identifier: string,
  password: string,
}

const LoginPage = () => {
  const[isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: {errors} } = useForm<IFormInput>({
    // Package to display the error message under the input
    resolver: yupResolver(loginSchema)
  });

  // Handlers
  const onSubmit: SubmitHandler<IFormInput> = async(data) => {
    // console.log(data);
    //1 - Pending => Loading
    setIsLoading(true);

    try{
    //2 - Fullfilled => SUCCESS (OPTIONAL)
     const {status, data:resData} = await axiosInstance.post("/auth/local", data);
     console.log(resData)
    //  console.log(status)
     if(status === 200) {
      toast.success('You will navige to Home Page page after 2 seconds!', {
        position: "bottom-center",
        duration: 1500,
        style: {
          backgroundColor: "black",
          color: "white",
          width: "fit-content"
        }
      })

      //To get JWT token for the auth operations
      localStorage.setItem("loggedInUser", JSON.stringify(resData))

      //we used location to make the page detict that we have navigated to another page
      //because navigate is not saved on local storage so the webapplication will not understand
      //where you want to navigate to
      setTimeout(() => {
        location.replace("/")
       }, 2000)

     }
    //3 - Rejected => FAILED (OPTIONAL)
    }catch(error){
      const errorObj = error as AxiosError<IErrorResponse>;
      toast.error(`${errorObj.response?.data.error.message}`, {
        position: "bottom-center",
        duration: 1500
      })
    } finally {
      setIsLoading(false)
    }

  };

  // Renders
  //Arr to return every time this div instead of writing it many times
  const renderLoginForm = LOGIN_FORM.map(({name, placeholder, type, validation}, idx) => (
    <div key={idx}>
      <Input 
      type={type}
        placeholder={placeholder}
        {...register(name, validation)}/>
        {/**Validation error */}
        {errors[name] && <InputErrorMessage msg={errors[name]?.message} />}
        {/* {errors?.username && errors.username.type === "required" && <InputErrorMessage msg="Username is required" />}
        {errors?.username && errors.username.type === "minLength" && <InputErrorMessage msg="Username should be at-least 5 characters" />} */}
    </div>
  ));


  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-center mb-4 text-3xl font-semibold text-black">Login to get access!</h2>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}> 
        {renderLoginForm}

        <Button fullWidth isLoading={isLoading}>Login</Button>
      </form>
    </div>
  )
}

export default LoginPage;
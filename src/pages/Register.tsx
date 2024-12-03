import { useForm, SubmitHandler } from "react-hook-form"
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import InputErrorMessage from "../components/ui/InputErrorMessage";
import { REGISTER_FORM } from "../data";
import { yupResolver } from "@hookform/resolvers/yup";
import { registerSchema } from "../validation";
import axiosInstance from "../config/axios.config";
import toast from "react-hot-toast";
import { useState } from "react";
import { AxiosError } from "axios";
import { IErrorResponse } from "../interfaces";
import { useNavigate } from "react-router-dom";

interface IFormInput {
  username: string,
  email: string,
  password: string,
}

const RegisterPage = () => {
  const navigate = useNavigate();
  const[isLoading, setIsLoading] = useState(false);
  const { register, handleSubmit, formState: {errors} } = useForm<IFormInput>({
    // Package to display the error message under the input
    resolver: yupResolver(registerSchema)
  });

  // Handlers
  const onSubmit: SubmitHandler<IFormInput> = async(data) => {
    // console.log(data);
    //1 - Pending => Loading
    setIsLoading(true);

    try{
    //2 - Fullfilled => SUCCESS (OPTIONAL)
     const {status} = await axiosInstance.post("/auth/local/register", data);
      console.log(status)
     if(status === 200) {
      toast.success('You will navige to the login page after 2 seconds to login!', {
        position: "bottom-center",
        duration: 1500,
        style: {
          backgroundColor: "black",
          color: "white",
          width: "fit-content"
        }
      });
      setTimeout(() => {
       navigate('/login')
      }, 2000)

    }

    //3 - Rejected => FAILED (OPTIONAL)
    }catch(error){
      const errorObj = error as AxiosError<IErrorResponse>;
      toast.error(`${errorObj.response?.data.error.message}`, {
        position: "bottom-center",
        duration: 4000
      })
    } finally {
      setIsLoading(false)
    }
  };

  // Renders
  //Arr to return every time this div instead of writing it many times
  const renderRegisterForm = REGISTER_FORM.map(({name, placeholder, type, validation}, idx) => (
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
      <h2 className="text-center mb-4 text-3xl font-semibold">Register to get access!</h2>
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}> 
        {renderRegisterForm}
        
        <Button fullWidth isLoading={isLoading}>Register</Button>
      </form>
    </div>
  );
};

export default RegisterPage
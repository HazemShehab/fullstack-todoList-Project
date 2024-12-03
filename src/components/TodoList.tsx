import Button from "./ui/Button";
import useCustomQuery from "../hooks/useAuthenticatedQuery";
import Modal from "./ui/Modal";
import { ChangeEvent, FormEvent, useState } from "react";
import Input from "./ui/Input";
import Textarea from "./ui/Textarea";
import { ITodo } from "../interfaces";
import axiosInstance from "../config/axios.config";
import TodoSkeleton from "./TodoSkeleton";
import { faker } from '@faker-js/faker';

const TodoList = () => {
  const storageKey = "loggedInUser";
  const userDataString = localStorage.getItem(storageKey);
  const userData = userDataString ? JSON.parse(userDataString) : null;

  const [queryVersion, setQueryVersion] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isOpenConfirmModal, setIsOpenConfirmModal] = useState(false);
  const [isOpenAddModal, setIsOpenAddModal] = useState(false);

  const [todoToAdd, setTodoToAdd] = useState({
    title:"",
    description:"",
  })

  const [todoToEdit, setTodoToEdit] = useState<ITodo>({
    id:0,
    title:"",
    description:"",
    documentId:""
  })

  const {isLoading, data} = useCustomQuery({
    //querykey can fetch if there is anything have changed, so we have used it to render anychange
    queryKey: ["todoList", `${queryVersion}`], 
    url: ("/users/me?populate=todos"),
    config: {
      headers: {
        Authorization: `Bearer ${userData.jwt}`
      }
    }
  })

  // const [todos, setTodos] = useState([])
  // const [isLoading, setIsLoading] = useState(true);
  //**To fetch data from API use (useEffect), but there is many other functions
  //more usefull that it
  // useEffect(() => {
  //   try {
  //     axiosInstance.get('/users/me?populate=todos',{
  //       headers: {
  //         Authorization: `Bearer ${userData.jwt}`
  //       }
  //     })
  //       .then(res=>setTodos(res.data.todos))
  //       .catch(err=> console.log("THE ERROR", err))
  //   } catch (error) {
  //     console.log(error)
  //   } finally {
  //     setIsLoading(false)
  //   }
  // }, [userData.jwt])
  // if (isLoading) return <h3>Loading...</h3>

  //**Note => useQuery always return object

  //**Handlers
  const onChangeAddTodoHandler = (evt:ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    //1_here is that value and name used to be able to recognize the different inputs at the same form
    const {value, name} = evt.target

    //2_grap all this to the setter, by graping the original value and using the name for the value
    setTodoToAdd({
      ...todoToAdd,
      [name]:value
    })
  }

  const onChangeHandler = (evt:ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    //1_here is that value and name used to be able to recognize the different inputs at the same form
    const {value, name} = evt.target

    //2_grap all this to the setter, by graping the original value and using the name for the value
    setTodoToEdit({
      ...todoToEdit,
      [name]:value
    })
  }


  const onGenerateTodo = async() => {
    for (let i = 0; i < 100; i++) {

      try {
        await axiosInstance.post(
          `/todos`,
          {data: {title:faker.word.words(5), description:faker.lorem.paragraph(2), user:[userData.user.id]}}, 
          {
            headers: {
              Authorization: `Bearer ${userData.jwt}`
            }
        })
        console.log(data)
      } catch (error) {
        console.log(error)
      }
    }
  }

  //we have used async because there is an request
  const onRemove = async() => {
    try {
      const {status} = await axiosInstance.delete(`/todos/${todoToEdit.documentId}`, {
        headers: {
          Authorization: `Bearer ${userData.jwt}`
        }
      })
      if(status === 200 || status === 204) {
        closeConfirmModal();
        setQueryVersion(prev => prev + 1);
      }
    } catch (error) {
      console.log(error)
    }
  }

  //aysnc function because we are dealing with request here like onsubmit
  const onSubmitAddTodo = async (evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault();

    //for loading spinner
    setIsUpdating(true)

    const {title, description} = todoToAdd;

    //to sumbit the edit on title and description we also used config with auth
    try {

      const {status} = await axiosInstance.post(
        `/todos`,
        {data: {title, description, user:[userData.user.id]}}, 
        {
          headers: {
            Authorization: `Bearer ${userData.jwt}`
          }
      })

      if(status === 200 || status === 201){
        onCloseAddModa();
        setQueryVersion(prev => prev + 1);
      }
      
    } catch (error) {
      console.log(error)
    } finally {
      setIsUpdating(false)
    }
  }

  const onSubmitUpdateTodo = async (evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault();

    //for loading spinner
    setIsUpdating(true)

    const {title, description} = todoToEdit

    //to sumbit the edit on title and description we also used config with auth
    try {

      const {status} = await axiosInstance.put(
        `/todos/${todoToEdit.documentId}`,
        {data: {title, description}}, {
        headers: {
          Authorization: `Bearer ${userData.jwt}`
        }
      })

      if(status === 200) {
        onCloseEditModa();
        setQueryVersion(prev => prev + 1);
      }
      
    } catch (error) {
      console.log(error)
    } finally {
      setIsUpdating(false)
    }
  }

  const closeConfirmModal = () => {
    setTodoToEdit({
      id:0,
      title:"",
      description:"",
      documentId:""
    })
    setIsOpenConfirmModal(false)
  }
  
  const onConfirmModal = (todo:ITodo) => {
    setTodoToEdit(todo)
    setIsOpenConfirmModal(true)
  }

  const onCloseAddModa = () => {
    setTodoToAdd({
      title:"",
      description:"",
    })

    setIsOpenAddModal(false);
  }

  const onOpenAddModa = () => {
    setIsOpenAddModal(true)
  }

  const onCloseEditModa = () => {
    setTodoToEdit({
      id:0,
      title:"",
      description:"",
      documentId:""
    })

    setIsEditModalOpen(false);
  }

  const onOpenEditModa = (todo:ITodo) => {
    setTodoToEdit(todo)
    setIsEditModalOpen(true)
  }

  if(isLoading) return (
    <div className="space-y-1 p-3">
      {Array.from({length: 3}, (_, idx) => <TodoSkeleton key={idx}/>)}
    </div>
  )

  let count=1;
  return (
    <div className="space-y-1">

      <div className="w-fit mx-auto my-10">
        {isLoading ? (
          <div className="flex items-center space-x-2">
            <div className="w-32 h-9 bg-gray-300 rounded-md dark:bg-gray-400"></div>
            <div className="w-32 h-9 bg-gray-300 rounded-md dark:bg-gray-400"></div>
          </div>
        ) : (
          <div className="flex w-fit space-x-2 mx-auto my-10">
            <Button size={"sm"} onClick={onOpenAddModa}>
              Post New Todo
            </Button>
            <Button variant={"outline"} size={"sm"} onClick={onGenerateTodo}>
              Generate todos
            </Button>
          </div>
        )}
      </div>
        {data.todos.length ? data.todos.map((todo:ITodo) => (

          <div key={todo.id} className="flex items-center justify-between hover:bg-gray-100 duration-300 p-3 rounded-md even:bg-gray-100">
              <p className="w-full font-semibold">{count++} - {todo.title}</p>
            <div className="flex items-center justify-end w-full space-x-3">
              <Button size={"sm"} onClick={() => onOpenEditModa(todo)}>
                Edit
              </Button>

              <Button variant={"danger"} size={"sm"} onClick={() => onConfirmModal(todo)}>
                Remove
              </Button>
            </div>

          </div>
      )) 
      : <h3 className="max-w-lg mx-auto">No Todos Yet 😀</h3>
      }

      {/*Add Modal */}
      <Modal isOpen={isOpenAddModal} closeModal={onCloseAddModa} title="Add A New Todo">

        <form className="space-y-3" onSubmit={onSubmitAddTodo}>

          <Input name="title" value={todoToAdd.title} onChange={onChangeAddTodoHandler}/>
          <Textarea name="description" value={todoToAdd.description} onChange={onChangeAddTodoHandler}/>

          <div className="flex items-center space-x-2 mt-4">
            <Button className="bg-indigo-700 hover:bg-indigo-800" isLoading={isUpdating}>Done</Button>
            <Button variant={"cancel"} onClick={onCloseAddModa} type="button">
              Cancel
            </Button>
          </div>

        </form>

      </Modal>


      {/*Edit Modal */}
      <Modal isOpen={isEditModalOpen} closeModal={onCloseEditModa} title="Edit this title">

        <form className="space-y-3" onSubmit={onSubmitUpdateTodo}>

          <Input name="title" value={todoToEdit.title} onChange={onChangeHandler}/>
          <Textarea name="description" value={todoToEdit.description} onChange={onChangeHandler}/>

          <div className="flex items-center space-x-2 mt-4">
            <Button className="bg-indigo-700 hover:bg-indigo-800" isLoading={isUpdating}>Update</Button>
            <Button variant={"cancel"} onClick={onCloseEditModa} type="button">
              Cancel
            </Button>
          </div>

        </form>

      </Modal>

      {/*Remove Modal */}
      <Modal isOpen={isOpenConfirmModal} closeModal={closeConfirmModal} 
        title="Are you sure you want to remove this todo"
        description="Deleting this todo will remove it permanetly from your inventory. Any associated data, sales history, and other related information
        will also be deleted. Please make sure htis is the intended action"
        >
        
        <div className="flex items-center space-x-3 space-y-2">
          <Button variant={"danger"} onClick={onRemove}>
            Yes, remove
          </Button>
          <Button variant={"cancel"} onClick={closeConfirmModal} type="button">
            Cancel
          </Button>
        </div>

      </Modal>

    </div>

    
  )
};

export default TodoList;
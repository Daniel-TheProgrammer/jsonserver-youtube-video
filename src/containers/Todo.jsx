import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// css file
import "../assets/stylesheet/containers/todo.css";

// server address
const URL =
  process.env.NODE_ENV === "production"
    ? `${process.env.REACT_APP_SERVER_URL}`
    : `${process.env.REACT_APP_CLIENT_URL}`;

const Todo = () => {
  const [name, setName] = useState("");
  const [todos, setTodos] = useState([]);
  const [filteredTodos, setFilteredTodos] = useState([]);
  const [totalTodos, setTotalTodos] = useState(todos.length);

  const loadTodos = useCallback(async () => {
    await axios
      .get(URL)
      .then((response) => {
        setTodos(response.data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  const updatedTotalTodos = useCallback(() => {
    setTotalTodos(todos.length);
  }, [todos.length]);

  useEffect(() => {
    updatedTotalTodos();
    setFilteredTodos(todos.filter((todo) => todo.completed === true));
  }, [todos, updatedTotalTodos]);

  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  const handleAdd = (e) => {
    e.preventDefault();
    if (name.length === 0) {
      toast.error("Empty field submissions not allowed!");
    } else {
      axios.post(URL, { id: totalTodos.length + 1, name, completed: false });
      toast.success("Todo successfully added.");
      setName("");
      setTimeout(() => {
        loadTodos();
      }, 500);
    }
  };

  const handleUpdate = (id) => {
    const todo = todos.filter((todo) => todo.id === id);

    axios.put(`${URL}/${id}`, {
      id: id,
      name: todo[0].name,
      completed: !todo[0].completed,
    });
    toast.success(
      `${todo[0].name} marked as ${
        todo[0].completed ? "uncompleted" : "completed"
      }.`
    );

    setTimeout(() => {
      loadTodos();
    }, 500);
  };

  const handleDelete = (e, id) => {
    e.preventDefault();

    if (window.confirm("Are you sure you want to delete this todo?")) {
      axios.delete(`${URL}/${id}`);
      toast.success("Todo successfully deleted.");
      setTimeout(() => {
        loadTodos();
      }, 500);
    } else {
      toast.success("Delete operation aborted.");
    }
  };

  const handleBatchDelete = (e) => {
    e.preventDefault();
    const batchRequests = [];

    if (todos.length === 0) {
      toast.dark("No todo added. Please add todos.");
      return;
    }

    if (filteredTodos.length === 0) {
      toast.warn("Select atleast one todo");
      return;
    }

    filteredTodos.forEach(function (item) {
      batchRequests.push(`${URL}/${item.id}`);
    });

    if (window.confirm("Are you sure you want to delete all selected todos?")) {
      axios.all(batchRequests.map((endpoint) => axios.delete(endpoint)));
      toast.success("Todos successfully deleted.");
      setTimeout(() => {
        loadTodos();
      }, 500);
    } else {
      toast.success("Batch delete operation aborted.");
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="todo__container flex a-j-center">
        <div className="todo__box">
          <div className="todo__head">
            <form className="todo__form flex" onSubmit={handleAdd}>
              <input
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                }}
                type="text"
                name="name"
                placeholder="Task name"
              />
              <button
                style={{
                  boxShadow:
                    name.length > 0
                      ? "0 0 10px 1px var(--box-shadow-color)"
                      : "inset 0 0 10px 1px var(--box-shadow-color)",
                }}
                type="submit"
              >
                Add Todo
              </button>
            </form>
          </div>
          <div className="todo__body">
            <div className="todo__body__top flex a-j-space-between">
              <h3>
                {filteredTodos.length}/{totalTodos}
              </h3>
              <button onClick={(e) => handleBatchDelete(e)}>
                <i aria-hidden="true" className="fa fa-times"></i>
                CLEAR DONE TODOS
              </button>
            </div>
            <div className="todo__body__display">
              {todos &&
                todos.length > 0 &&
                todos.map((todo, index) => {
                  return (
                    <div
                      key={index + todo.name}
                      className="todo flex a-j-space-between"
                    >
                      <div
                        onClick={() => {
                          handleUpdate(todo.id);
                        }}
                        style={{
                          width: "100%",
                          height: "100%",
                          alignItems: "center",
                          cursor: "pointer",
                          padding: "1rem 0.8rem",
                        }}
                        className="flex"
                      >
                        <div
                          className={`${todo.completed ? "check" : "uncheck"}`}
                        >
                          <i className="fa fa-check" aria-hidden="true"></i>
                        </div>
                        <h3
                          style={{
                            textDecoration: todo.completed
                              ? "line-through"
                              : null,
                          }}
                        >
                          {todo.name}
                        </h3>
                      </div>
                      <div style={{ margin: "0 0.8rem" }}>
                        <button
                          onClick={(e) => handleDelete(e, todo.id)}
                          className="flex a-j-center delete"
                        >
                          <i className="fa fa-times" aria-hidden="true"></i>
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Todo;

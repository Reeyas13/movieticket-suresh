export const customError=(status,message)=>{
    const err = new Error();
    err.status = status || 500;
    err.message = message || "something went wrong"
    return err
}
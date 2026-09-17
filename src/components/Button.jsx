import { Link } from "react-router-dom";
const Button = ({ link, title, Icon }) => {
  return (
    <div className="bg-white p-4 rounded shadow w-full flex justify-center fadeup">
      <Link
        to={link}
        className="font-bold text-lg hover:underline underline-offset-8 cursor-pointer"
      >
        <div className="flex flex-col gap-5 items-center">
          <div className="flex gap-3 text-[2rem]">
            <Icon />
          </div>
          <h1 className="text-[1.3rem] font-regular">{title}</h1>
        </div>
      </Link>
    </div>
  );
};

export default Button;

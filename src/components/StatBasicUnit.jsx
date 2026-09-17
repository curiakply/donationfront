const StatBasicUnit = ({ unit, number, Icon }) => {
  return (
    <div className=" p-[4rem] py-[3rem] w-full flex flex-col items-center bg-white rounded-[2rem] transition fadedown">
      <Icon className="text-[2rem] mb-5" />
      <h3 className="font-regular text-lg text-gray-400">{unit}</h3>
      <h1 className="text-3xl font-regular mt-5">{number}</h1>
    </div>
  );
};
export default StatBasicUnit;

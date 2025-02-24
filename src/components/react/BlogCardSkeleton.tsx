const BlogCardSkeleton: React.FC = () => {
  return (
    <div className="border shadow border-gray-200 rounded py-5 px-5 w-full">
      <div className="space-y-2 motion-safe:animate-pulse">
        <div className="flex space-x-4 items-center">
          <div className="grow h-7 flex">
            <div className="bg-gray-200 w-[50%] rounded-full my-0.5"></div>
          </div>
          <div className="rounded-full h-[1.375rem] flex">
            <div className="bg-gray-200 w-16 rounded-full"></div>
          </div>
        </div>
        <div className="w-full h-5 flex">
          <div className="bg-gray-200 w-[60%] rounded-full my-0.5"></div>
        </div>
      </div>
    </div>
  );
};

export default BlogCardSkeleton;

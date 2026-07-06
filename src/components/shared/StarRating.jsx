import React, { useState } from "react";
import { Star } from "lucide-react";
import { triggerHaptic } from "../../utils/haptics";
const StarRating = ({
  rating = 0,
  onRate,
  size = 20,
  readOnly = false,
  showCount = false,
  count = 0,
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  const handleClick = (value) => {
    if (readOnly) return;
    triggerHaptic("light");
    onRate?.(value);
  };
  const displayRating = hoverRating || rating;
  return (
    <div className="flex items-center gap-1.5">
      {" "}
      <div className="flex gap-0.5">
        {" "}
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => handleClick(star)}
            onMouseEnter={() => !readOnly && setHoverRating(star)}
            onMouseLeave={() => !readOnly && setHoverRating(0)}
            disabled={readOnly}
            className={`transition-all duration-150 ${readOnly ? "cursor-default" : "cursor-pointer active:scale-125"}`}
          >
            {" "}
            <Star
              size={size}
              className={`transition-colors ${star <= displayRating ? "fill-amber-400 text-amber-400" : "fill-transparent text-slate-600"}`}
            />{" "}
          </button>
        ))}{" "}
      </div>{" "}
      {showCount && (
        <span className="text-[10px] font-bold text-slate-500 ml-1">
          {" "}
          {rating.toFixed(1)} ({count}){" "}
        </span>
      )}{" "}
    </div>
  );
};
export default StarRating;

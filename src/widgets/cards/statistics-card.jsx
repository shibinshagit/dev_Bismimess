import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Typography,
} from "@material-tailwind/react";
import { LeafIcon } from "lucide-react";
import PropTypes from "prop-types";

const styles = {
  shiningEffect: {
    background: "linear-gradient(270deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.1) 50%, rgba(255, 255, 255, 0.5) 100%)",
    backgroundSize: "200% 100%",
    animation: "shine 1.5s infinite",
  },
};

// Adding keyframes for the shine effect
const shineKeyframes = `
@keyframes shine {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
`;

export function StatisticsCard({ color, icon, title, value, veg, footer }) {
  return (
    <>
      <style>{shineKeyframes}</style>
      <Card className="border bg-gray-400 border-blue-gray-100 shadow-sm p-3 relative overflow-hidden">
        <div className="absolute inset-0" style={styles.shiningEffect}></div>
        <div className="relative z-10 flex flex-col items-center gap-1">
          <div className="flex items-center">
            <Typography variant="small" className="font-medium text-blue-gray-700">
              {title}
            </Typography>
          </div>
          <Typography variant="h4" color="blue-gray" className="text-center font-semibold relative z-10">
            {value}
          </Typography>
        </div>
        <div className="mt-2">
          <span className=" text-green-800 px-2 py-1 rounded text-xs font-semibold flex items-center">
            {/* You can use an icon if you prefer */}
            <LeafIcon className="w-4 h-4 mr-1" />
            Veg: {veg?veg:'0'}
          </span>
        </div>
      </Card>
    </>
  );
}

StatisticsCard.defaultProps = {
  color: "blue",
  footer: null,
};

StatisticsCard.propTypes = {
  color: PropTypes.oneOf([
    "white",
    "blue-gray",
    "gray",
    "brown",
    "deep-orange",
    "orange",
    "amber",
    "yellow",
    "lime",
    "light-green",
    "green",
    "teal",
    "cyan",
    "light-blue",
    "blue",
    "indigo",
    "deep-purple",
    "purple",
    "pink",
    "red",
  ]),
  icon: PropTypes.node.isRequired,
  title: PropTypes.node.isRequired,
  value: PropTypes.node.isRequired,
  footer: PropTypes.node,
};

StatisticsCard.displayName = "/src/widgets/cards/statistics-card.jsx";

export default StatisticsCard;

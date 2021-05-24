import Elia from "../Elia";

export default abstract class LateInitComponent {
    abstract init(elia: Elia): void
}
/*
 * 成品规格弹窗 - 展示所有文件的格式、尺寸、命名规范
 * 品牌视觉：废柴家族 — 暖灰/奶白中性色调
 */

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface SpecsDialogProps {
  open: boolean;
  onClose: () => void;
}

export default function SpecsDialog({ open, onClose }: SpecsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto" style={{ background: "oklch(0.985 0.003 60)" }}>
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-brand-charcoal">成品规格</DialogTitle>
        </DialogHeader>

        <div className="overflow-x-auto rounded-lg" style={{ border: "1px solid oklch(0.92 0.005 60)" }}>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr style={{ background: "oklch(0.96 0.004 60)" }}>
                <th className="px-3 py-2.5 text-left font-semibold text-brand-brown w-16" style={{ borderBottom: "1px solid oklch(0.90 0.006 60)" }}></th>
                <th className="px-3 py-2.5 text-left font-semibold text-brand-brown w-24" style={{ borderBottom: "1px solid oklch(0.90 0.006 60)" }}>解释说明</th>
                <th className="px-3 py-2.5 text-left font-semibold text-brand-brown" style={{ borderBottom: "1px solid oklch(0.90 0.006 60)" }}>安卓</th>
                <th className="px-3 py-2.5 text-left font-semibold text-brand-brown" style={{ borderBottom: "1px solid oklch(0.90 0.006 60)" }}>iOS9键</th>
                <th className="px-3 py-2.5 text-left font-semibold text-brand-brown" style={{ borderBottom: "1px solid oklch(0.90 0.006 60)" }}>iOS26键</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ background: "oklch(0.995 0.002 60)" }}>
                <td className="px-3 py-2 text-center font-medium text-brand-brown" style={{ borderBottom: "1px solid oklch(0.93 0.005 60)" }}>1</td>
                <td className="px-3 py-2 text-brand-brown" style={{ borderBottom: "1px solid oklch(0.93 0.005 60)" }}>解释说明</td>
                <td className="px-3 py-2 text-brand-charcoal" style={{ borderBottom: "1px solid oklch(0.93 0.005 60)" }}>上传一个安卓视频</td>
                <td className="px-3 py-2 text-brand-charcoal" style={{ borderBottom: "1px solid oklch(0.93 0.005 60)" }}>上传 iOS9键视频</td>
                <td className="px-3 py-2 text-brand-charcoal" style={{ borderBottom: "1px solid oklch(0.93 0.005 60)" }}>上传 iOS26键视频</td>
              </tr>
              <tr style={{ background: "oklch(0.975 0.003 60)" }}>
                <td className="px-3 py-2 text-center font-medium text-brand-brown" style={{ borderBottom: "1px solid oklch(0.93 0.005 60)" }}>2</td>
                <td className="px-3 py-2 text-brand-brown" style={{ borderBottom: "1px solid oklch(0.93 0.005 60)" }}>视频</td>
                <td className="px-3 py-2" style={{ borderBottom: "1px solid oklch(0.93 0.005 60)" }}>
                  <div className="text-brand-charcoal">格式:mp4</div>
                  <div className="text-brand-charcoal">尺寸(px):474*370</div>
                  <div className="text-brand-charcoal">大小: &lt;1.5MB</div>
                  <div className="text-brand-charcoal">文件名:安卓视频.mp4</div>
                </td>
                <td className="px-3 py-2" style={{ borderBottom: "1px solid oklch(0.93 0.005 60)" }}>
                  <div className="text-brand-charcoal">格式:mp4</div>
                  <div className="text-brand-charcoal">尺寸(px):750*564</div>
                  <div className="text-brand-charcoal">大小: &lt;1.5MB</div>
                  <div className="text-brand-charcoal">文件名:iOS视频9.mp4</div>
                  <div className="text-brand-brown-light">说明:ios9 视频</div>
                </td>
                <td className="px-3 py-2" style={{ borderBottom: "1px solid oklch(0.93 0.005 60)" }}>
                  <div className="text-brand-charcoal">格式:mp4</div>
                  <div className="text-brand-charcoal">尺寸(px):750*564</div>
                  <div className="text-brand-charcoal">大小: &lt;1.5MB</div>
                  <div className="text-brand-charcoal">文件名:iOS视频26.mp4</div>
                  <div style={{ color: "oklch(0.55 0.18 25)" }}>说明:ios26 视频,最终打包不需要，用于生成 ios26 动态 gif</div>
                </td>
              </tr>
              <tr style={{ background: "oklch(0.995 0.002 60)" }}>
                <td className="px-3 py-2 text-center font-medium text-brand-brown" style={{ borderBottom: "1px solid oklch(0.93 0.005 60)" }}>3</td>
                <td className="px-3 py-2 text-brand-brown" style={{ borderBottom: "1px solid oklch(0.93 0.005 60)" }}>套装视频</td>
                <td className="px-3 py-2" style={{ borderBottom: "1px solid oklch(0.93 0.005 60)" }}>
                  <div className="text-brand-charcoal">格式:mp4</div>
                  <div className="text-brand-charcoal">尺寸(px):656*494</div>
                  <div className="text-brand-charcoal">大小: &lt;1.5MB</div>
                  <div className="text-brand-charcoal">文件名:安卓套装.mp4</div>
                  <div className="text-brand-brown-light">说明:安卓套装需增加此视频</div>
                </td>
                <td className="px-3 py-2" style={{ borderBottom: "1px solid oklch(0.93 0.005 60)" }}>
                  <div className="text-brand-charcoal">格式:mp4</div>
                  <div className="text-brand-charcoal">尺寸(px):656*494</div>
                  <div className="text-brand-charcoal">大小: &lt;1.5MB</div>
                  <div className="text-brand-charcoal">文件名:iOS套装.mp4</div>
                  <div className="text-brand-brown-light">说明:套装需增加视频-ios9视频</div>
                </td>
                <td className="px-3 py-2" style={{ borderBottom: "1px solid oklch(0.93 0.005 60)" }}></td>
              </tr>
              <tr style={{ background: "oklch(0.975 0.003 60)" }}>
                <td className="px-3 py-2 text-center font-medium text-brand-brown" style={{ borderBottom: "1px solid oklch(0.93 0.005 60)" }}>4</td>
                <td className="px-3 py-2 text-brand-brown" style={{ borderBottom: "1px solid oklch(0.93 0.005 60)" }}>首帧</td>
                <td className="px-3 py-2" style={{ borderBottom: "1px solid oklch(0.93 0.005 60)" }}>
                  <div className="text-brand-charcoal">格式:png</div>
                  <div className="text-brand-charcoal">文件名:安卓首帧.png</div>
                  <div className="text-brand-brown-light">说明: 视频的首帧静图</div>
                </td>
                <td className="px-3 py-2" style={{ borderBottom: "1px solid oklch(0.93 0.005 60)" }}></td>
                <td className="px-3 py-2" style={{ borderBottom: "1px solid oklch(0.93 0.005 60)" }}></td>
              </tr>
              <tr style={{ background: "oklch(0.995 0.002 60)" }}>
                <td className="px-3 py-2 text-center font-medium text-brand-brown" style={{ borderBottom: "1px solid oklch(0.93 0.005 60)" }}>5</td>
                <td className="px-3 py-2 text-brand-brown" style={{ borderBottom: "1px solid oklch(0.93 0.005 60)" }}>动图</td>
                <td className="px-3 py-2" style={{ borderBottom: "1px solid oklch(0.93 0.005 60)" }}>
                  <div className="text-brand-charcoal">格式:gif</div>
                  <div className="text-brand-charcoal">尺寸(px):364*285</div>
                  <div className="text-brand-charcoal">大小: &lt;3MB</div>
                  <div className="text-brand-charcoal">文件名:安卓动图.gif</div>
                </td>
                <td className="px-3 py-2" style={{ borderBottom: "1px solid oklch(0.93 0.005 60)" }}>
                  <div className="text-brand-charcoal">格式:gif</div>
                  <div className="text-brand-charcoal">尺寸(px):364*274</div>
                  <div className="text-brand-charcoal">大小: &lt;3MB</div>
                  <div className="text-brand-charcoal">文件名:iOS动图9.gif</div>
                  <div className="text-brand-brown-light">说明:iOS视频9.mp4生成</div>
                </td>
                <td className="px-3 py-2" style={{ borderBottom: "1px solid oklch(0.93 0.005 60)" }}>
                  <div className="text-brand-charcoal">格式:gif</div>
                  <div className="text-brand-charcoal">尺寸(px):364*274</div>
                  <div className="text-brand-charcoal">大小: &lt;3MB</div>
                  <div className="text-brand-charcoal">文件名:iOS动图26.gif</div>
                  <div className="text-brand-brown-light">说明:iOS视频26.mp4生成</div>
                </td>
              </tr>
              <tr style={{ background: "oklch(0.975 0.003 60)" }}>
                <td className="px-3 py-2 text-center font-medium text-brand-brown" style={{ borderBottom: "1px solid oklch(0.93 0.005 60)" }}>6</td>
                <td className="px-3 py-2 text-brand-brown" style={{ borderBottom: "1px solid oklch(0.93 0.005 60)" }}>套装动图</td>
                <td className="px-3 py-2" style={{ borderBottom: "1px solid oklch(0.93 0.005 60)" }}>
                  <div className="text-brand-charcoal">格式:gif</div>
                  <div className="text-brand-charcoal">尺寸(px):364*285</div>
                  <div className="text-brand-charcoal">大小: &lt;3MB</div>
                  <div className="text-brand-charcoal">文件名:安卓动图tz.gif</div>
                  <div className="text-brand-brown-light">说明:套装需增加此动图</div>
                </td>
                <td className="px-3 py-2" style={{ borderBottom: "1px solid oklch(0.93 0.005 60)" }}>
                  <div className="text-brand-charcoal">格式:gif</div>
                  <div className="text-brand-charcoal">尺寸(px):364*274</div>
                  <div className="text-brand-charcoal">大小: &lt;3MB</div>
                  <div className="text-brand-charcoal">文件名:iOS动图9tz.gif</div>
                  <div className="text-brand-brown-light">说明:套装需增加此动图，iOS视频9.mp4生成</div>
                </td>
                <td className="px-3 py-2" style={{ borderBottom: "1px solid oklch(0.93 0.005 60)" }}>
                  <div className="text-brand-charcoal">格式:gif</div>
                  <div className="text-brand-charcoal">尺寸(px):364*274</div>
                  <div className="text-brand-charcoal">大小: &lt;3MB</div>
                  <div className="text-brand-charcoal">文件名:iOS动图26tz.gif</div>
                  <div className="text-brand-brown-light">说明:套装需增加此动图,iOS视频26.mp4生成</div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-6 space-y-4 text-sm">
          <div>
            <h4 className="font-bold text-base mb-2 text-brand-charcoal">输出文件夹命名方式：</h4>
            <p className="text-brand-brown">价格+套装/主题+【主题名】，文件夹先改名再压缩！！</p>
          </div>

          <div>
            <h4 className="font-bold mb-1 text-brand-charcoal">常规内容示例：</h4>
            <p className="text-brand-brown-light">3元【甜宝小猪软糯日常】.zip</p>
            <p className="text-brand-brown-light">双色内容示例：3元【甜点小考拉】.zip</p>
            <p className="text-brand-brown-light">双色背光内容示例：8元【蝶绕星川】.zip</p>
          </div>

          <div>
            <h4 className="font-bold mb-1 text-brand-charcoal">常规套装内容示例：</h4>
            <p className="text-brand-brown-light">6元 套装皮肤【赛博朋克朱迪尼克】.zip</p>
            <p className="text-brand-brown-light">双色宠物背光套装内容示例：12元 宠物背光套装【小羊波德莱尔】.zip</p>
          </div>

          <div>
            <h4 className="font-bold mb-1 text-brand-charcoal">套装目录：</h4>
            <pre className="p-3 rounded-lg text-xs leading-relaxed text-brand-charcoal" style={{ background: "oklch(0.96 0.004 60)" }}>
{`6元+套装皮肤【赛博朋克朱迪尼克】.zip
├── iOS动图26.gif
├── iOS动图26tz.gif
├── iOS动图9.gif
├── iOS动图9tz.gif
├── iOS套装.mp4
├── iOS视频9.mp4
├── 安卓动图.gif
├── 安卓动图tz.gif
├── 安卓套装.mp4
├── 安卓视频.mp4
└── 安卓视频首帧.png`}
            </pre>
          </div>

          <div>
            <h4 className="font-bold mb-1 text-brand-charcoal">常规目录：</h4>
            <pre className="p-3 rounded-lg text-xs leading-relaxed text-brand-charcoal" style={{ background: "oklch(0.96 0.004 60)" }}>
{`3元【甜宝小猪软糯日常】.zip
├── iOS动图26.gif
├── iOS动图9.gif
├── iOS视频9.mp4
├── 安卓动图.gif
├── 安卓视频.mp4
└── 安卓首帧.png`}
            </pre>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="border-brand-warm text-brand-brown">关闭</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
